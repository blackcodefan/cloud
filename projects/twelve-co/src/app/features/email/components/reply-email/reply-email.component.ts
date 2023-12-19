import { EmailHelper } from './../../services/email.helper';
import { TranslateService } from '@ngx-translate/core';
import { Receiver } from './../../model/receiver.model';
import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, OnDestroy } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { ResizedEvent } from 'angular-resize-event';
import { AccountSummary, DomService, FileSizePipe, ItemDetails, ItemOperationOptionEnum, ItemTypeEnum, LoggingService, selectSelectedAccount, StorageMinDto, StoragesMinDto, TagColorEnum } from 'core-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, filter, switchMap } from 'rxjs';
import { SubSink } from 'subsink';
import { v4 } from 'uuid';
import { BoxEmailContentItem, BoxEmailItem, EmailAttachment, EmailData, EmailDraftItem, EmailShowStatus, EmailViewItem } from '../../model';
import { EmailService } from '../../services/email.service';
import { EmailState } from '../../store';

import { ScheduleEmailComponent } from '../schedule-email/schedule-email.component';
import { ConfirmToSaveDraftEmailComponent } from '../confirm-to-save-draft-email/confirm-to-save-draft-email.component';

@Component({
    selector: 'app-reply-email',
    templateUrl: './reply-email.component.html',
    styleUrls: [ './reply-email.component.scss' ],
})
export class ReplyEmailComponent implements OnInit, AfterViewInit, OnDestroy {

    @Input() preVal: any;
    @Input() isReply!: boolean;
    @Output() isNewReply = new EventEmitter();
    @ViewChild('searchReceiverInput') searchReceiverInput!: ElementRef<HTMLInputElement>;
    @ViewChild('searchCCReceiverInput') searchCCReceiverInput!: ElementRef<HTMLInputElement>;
    @ViewChild('searchBccReceiverInput') searchBCCReceiverInput!: ElementRef<HTMLInputElement>;

    fileSizePipe = new FileSizePipe();
    separatorKeysCodes: number[] = [ ENTER, COMMA, SPACE ];
    receiverCtrl = new UntypedFormControl();
    ccReceiverCtrl = new UntypedFormControl();
    bccReceiverCtrl = new UntypedFormControl();
    filteredReceivers: Array<Receiver>;
    receivers: Array<Receiver> = [];
    ccReceivers: Array<Receiver> = [];
    bccReceivers: Array<Receiver> = [];
    mergedReceivers: Array<Receiver> = []; // display all receivers when receivers area is collapsed

    newBoxEmailItemSaving: boolean;
    boxEmailSubjectInput: boolean;
    lastEmailSubmitFormDistanceX: number;
    lastEmailSubmitFormDistanceY: number;
    lastEmailListDistanceX: number;
    lastEmailListDistanceY: number;
    emailSubmitFormWidth: number;
    emailListWidth: number;
    currentFocusedComposedEmailInputField: number;
    formData: FormData;
    newBoxEmailItem: BoxEmailItem = {
        id: v4(),
        subject: '',
        sender: '',
        senderUserName: '',
        copyright: 'public',
        content: new Array<any>(),
        attachment: false,
        attachmentList: [],
        submitDate: '',
        hide: false,
    };
    sentBoxEmailList: Array<BoxEmailItem>;
    editNewEmail: boolean;
    progress: number;
    boxEmailRecipientFocused: boolean = false;
    newToChipListCreated!: boolean;
    newCcChipListCreated!: boolean;
    newBccChipListCreated!: boolean;
    isAttachment: boolean = false;
    attachmentListHeight: number = 0;
    isToGroupIcon: boolean = false;
    isToGroupRightMenu: boolean = false;
    isCcGroupIcon: boolean = false;
    isCcGroupRightMenu: boolean = false;
    isBccGroupIcon: boolean = false;
    isBccGroupRightMenu: boolean = false;
    isShowMore: boolean = false;
    account: AccountSummary;
    lastEmailInChain: EmailData;
    totalFileSize = 0;
    totalStringSize: string = '';

    private subSink = new SubSink();

    constructor(
        private domService: DomService,
        private matDialogService: MatDialog,
        private dialogRef: MatDialogRef<ReplyEmailComponent>,
        private emailService: EmailService,
        private store: Store<EmailState>,
        private spinner: NgxSpinnerService,
        private matDialogRef: MatDialogRef<ReplyEmailComponent>,
        private matSnack: MatSnackBar,
        private translateService: TranslateService,
        private logger: LoggingService,
        private emailHelper: EmailHelper
    ) {
        this.formData = new FormData();
        this.progress = 0;
        this.boxEmailSubjectInput = false;
        this.newBoxEmailItemSaving = false;
        this.editNewEmail = false;
        this.lastEmailSubmitFormDistanceX = 0;
        this.lastEmailSubmitFormDistanceY = 0;
        this.lastEmailListDistanceX = 0;
        this.lastEmailListDistanceY = 0;
        this.emailSubmitFormWidth = 500;
        this.emailListWidth = 532;
        this.sentBoxEmailList = new Array<BoxEmailItem>();
        const newBoxEmailContentItem: BoxEmailContentItem = {
            type: 'message',
            content: '',
            caretPosition: -2,
        };
        this.newBoxEmailItem.content.push(newBoxEmailContentItem);
        this.currentFocusedComposedEmailInputField = -1;

        this.subSink.sink = this.receiverCtrl.valueChanges
            .pipe(
                debounceTime(300),
                switchMap(txt => this.emailService.searchAccount(txt)),
            ).subscribe((res) => this.filteredReceivers = res.map(obj => ({
                accountId: obj.id,
                name: obj.fullName,
                accountName: obj.accountName,
                email: null,
                receiverId: null
            }))
            );

            this.subSink.sink = this.ccReceiverCtrl.valueChanges
            .pipe(
                debounceTime(300),
                switchMap(txt => this.emailService.searchAccount(txt)),
            ).subscribe((res) => this.filteredReceivers = res.map(obj => ({
                accountId: obj.id,
                name: obj.fullName,
                accountName: obj.accountName,
                email: null,
                receiverId: null
            }))
            );

            this.subSink.sink = this.bccReceiverCtrl.valueChanges
            .pipe(
                debounceTime(300),
                switchMap(txt => this.emailService.searchAccount(txt)),
            ).subscribe((res) => this.filteredReceivers = res.map(obj => ({
                accountId: obj.id,
                name: obj.fullName,
                accountName: obj.accountName,
                email: null,
                receiverId: null
            }))
            );
    }

    ngOnInit(): void {
        this.subSink.sink = this.store.pipe(select(selectSelectedAccount), filter(a => JSON.stringify(a) !== JSON.stringify({})))
            .subscribe((selectedAccount: AccountSummary) => {
                this.account = selectedAccount;

                this.newBoxEmailItem.sender = this.account.email;
                this.newBoxEmailItem.senderUserName = this.account.fullName;
            });

        this.spinner.show();
        this.subSink.sink = this.emailService.getEmailForId(this.preVal.lastEmailInChainId).subscribe(email => {
            this.lastEmailInChain = email;
            this.newBoxEmailItem.subject = this.lastEmailInChain.subject;
            const replayPrefix = `<p><br></p><p>On ${new Date(this.lastEmailInChain.created).toLocaleString()} ${this.lastEmailInChain.createdBy?.name} &lt${this.lastEmailInChain.createdBy?.email}&gt wrote:</p><p><br></p>`;
            const newBody = this.lastEmailInChain.body.replace('"content":"', '"content":"' + replayPrefix);
            this.newBoxEmailItem.content = this.account.allowDecrypt ? JSON.parse(newBody) : this.lastEmailInChain.body;
            // add receiver, but skip the current account, that replay
            this.receivers = this.lastEmailInChain.receivers.filter(x => x.accountId !== this.account.id);
            const sender: Receiver = {
                accountId: this.lastEmailInChain.createdBy?.id,
                accountName: this.lastEmailInChain.createdBy?.name,
                name: this.lastEmailInChain.createdBy?.fullName
            };
            this.receivers.push(sender);
            this.ccReceivers = this.lastEmailInChain.receiversCc.filter(x => x.accountId !== this.account.id); ;
            // clean receivers's id, because it will be new email
            this.receivers.forEach(x => x.receiverId = null);
            this.ccReceivers.forEach(x => x.receiverId = null);
            this.mergedReceivers.push(...this.receivers);
            this.mergedReceivers.push(...this.ccReceivers);
            // this.bccReceivers = this.lastEmailInChain.receiversBcc;
            this.spinner.hide();
        }, error => {
            console.error('Error while loading last email in chain', error);
            this.matSnack.open('Error while loading last email in chain', error?.error?.message);
            this.spinner.hide();
        });

    }

    ngAfterViewInit() {
        /*        setTimeout(() => {
                    const quillEditor = document.getElementsByClassName('ql-editor')[0] as HTMLElement;
                    console.log(quillEditor);
                    quillEditor.focus();
                }, 500);*/
    }

    ngOnDestroy(): void {
        this.subSink.unsubscribe()
    }

    // upload attachment file for box email
    uploadFiles(event: Event, input: HTMLInputElement) {
        this.progress = 0;
        this.setTestProgressValue();
        let targetElement = event.target as HTMLInputElement;
        let fileList = targetElement.files as FileList;
        Array.prototype.forEach.call(fileList, file => {
            let attachmentFile: EmailAttachment = {
                attachmentFileType: '',
                attachmentFileName: '',
                attachmentFileExtension: '',
                attachmentFileSize: 0,
                attachmentFile: '',
                attachmentId: '',
                emailAttachmentId: null
            };
            attachmentFile.attachmentFileName = file.name;
            attachmentFile.attachmentFileSize = file.size; //this.fileSizePipe.transform(file.size);
            attachmentFile.attachmentFile = file;
            this.totalFileSize = this.totalFileSize + file.size;
            this.totalStringSize = this.fileSizePipe.transform(this.totalFileSize);
            this.newBoxEmailItem.attachment = true;
            let fileType = '';
            let fileExt = '';
            if (file.type.includes('image')) { // in case of file type is image
                fileType = 'image';
                fileExt = file.type.replace('image/', '');
            } else { // in case of file type is file not image.
                fileType = 'file';
                fileExt = file.name.split('.').pop() as string;;
            }

            const reader = new FileReader();
            reader.onload = (e: any) => {
                // attachmentFile.attachmentImageUrl = e.target['result'];
                attachmentFile.attachmentFileType = fileType;
                attachmentFile.attachmentFileExtension = fileExt;
                this.newBoxEmailItem.attachmentList.push(attachmentFile);
                this.isAttachment = true;
                this.attachmentListHeight = 216;
            };
            this.logger.info(`uploading ${ file.name }`);
            const formData = new FormData();
            let fileUploadDetails = {
                accountId: this.account.id,
                parentId: null,
                size: file.size,
                mimeType: file.type,
                fileOperationOption: ItemOperationOptionEnum.FILE_NEW,
                type: ItemTypeEnum.EMAIL_ATT,
            };
            formData.append('file', file);
            formData.append('fileDetails', JSON.stringify(fileUploadDetails));
            this.subSink.sink = this.emailService.uploadFile(formData).subscribe((response: HttpEvent<any>) => {
                if (response.type === HttpEventType.Response) {
                    this.logger.info('Upload complete');
                    const item = response.body as unknown as ItemDetails;
                    attachmentFile.attachmentId = item.itemId;
                    // this.newBoxEmailItem.attachmentList.push(attachmentFile);
                    reader.readAsDataURL(file);
                }
                if (response.type === HttpEventType.UploadProgress) {
                    const percentDone = Math.round(100 * response.loaded / response.total!);
                    this.logger.info('Progress ' + percentDone + '%');
                    // this.store.dispatch(setUploadingItemAction({
                    //     item: {
                    //         fileName: file.name,
                    //         sizeUploaded: response.loaded!,
                    //         size: response.total!,
                    //         progress: percentDone,
                    //         done: response.loaded === response.total,
                    //         errorStatus: false,
                    //     },
                    // }));
                }
                this.logger.info('uploaded file');

            }, (error => {
                this.logger.error('Error uploading file ', error?.error);
                this.matSnack.open('Error uploading file', error?.error?.message);
                // this.store.dispatch(setUploadingItemAction({
                //     item: {
                //         fileName: file.name,
                //         sizeUploaded: file.size,
                //         size: file.size!,
                //         progress: 0,
                //         done: false,
                //         errorStatus: true,
                //         error: error?.error?.message,
                //     },
                // }));
            }));
        });
    }

    setEditStatus() {
        this.editNewEmail = !this.editNewEmail;
    }

    setAttachmentStatus() {
        this.isAttachment = !this.isAttachment;
        if (this.isAttachment)
            this.attachmentListHeight = 216;
        else
            this.attachmentListHeight = 48;
    }

    // validate user email
    validateEmail(receiver: Receiver): boolean {
        const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (receiver.email ) {
            if (receiver.email.match(validRegex)) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    // focus out to input
    focusOutToInput() {
        this.boxEmailRecipientFocused = false;
        this.mergedReceivers = this.receivers.concat(this.ccReceivers);
        // this.mergedFullNameReceivers = this.fullNameReceivers.concat(this.fullNameCcReceivers);
        setTimeout(() => {
            const recipientsListElement = document.getElementById('boxEmailEllipseRecipientsList') as HTMLElement;
            if (recipientsListElement != undefined) {
                this.isShowMore = recipientsListElement.offsetWidth < recipientsListElement.scrollWidth;
            }
        }, 10);
    }

    // focus in to box email to input
    focusInBoxEmailInput() {
        this.boxEmailRecipientFocused = true;
    }

    // handle receiver part
    addReceiver(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();

        // create receiver with only email
        const receiver = {
            accountId: null,
            name: null,
            accountName: null,
            email: value,
            receiverId: null
        }
        // Add our fruit
        if (value) {
            this.receivers.push(receiver);
            this.mergedReceivers = [];
            this.mergedReceivers.push(...this.receivers);
            this.mergedReceivers.push(...this.ccReceivers);
            // this.fullNameReceivers.push({ name: value, email: '' });
        }

        // Clear the input value
        event.chipInput!.clear();

        this.receiverCtrl.setValue(null);
    }

    removeReceiver(fruit: Receiver): void {
        const index = this.receivers.indexOf(fruit);

        if (index >= 0) {
            this.receivers.splice(index, 1);
            this.mergedReceivers = [];
            this.mergedReceivers.push(...this.receivers);
            this.mergedReceivers.push(...this.ccReceivers);
            // this.fullNameReceivers.splice(index, 1);
        }
    }

    selectedReceiver(event: MatAutocompleteSelectedEvent): void {
        this.receivers.push(event.option.value);
        // this.fullNameReceivers.push({ name: this.initialReceiverNames[index], email: this.initialReceiverEmails[index] });
        this.searchReceiverInput.nativeElement.value = '';
        this.receiverCtrl.setValue(null);
    }

    // handle cc receiver part
    addCCReceiver(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();

        // create CC receiver with only email
        const receiver = {
            accountId: null,
            name: null,
            accountName: null,
            email: value,
            receiverId: null
        }
        // Add our fruit
        if (value) {
            this.ccReceivers.push(receiver);
            this.mergedReceivers = [];
            this.mergedReceivers.push(...this.receivers);
            this.mergedReceivers.push(...this.ccReceivers);
            // this.fullNameCcReceivers.push({ name: value, email: '' });
        }

        // Clear the input value
        event.chipInput!.clear();

        this.ccReceiverCtrl.setValue(null);
    }

    removeCCReceiver(fruit: Receiver): void {
        const index = this.ccReceivers.indexOf(fruit);

        if (index >= 0) {
            this.ccReceivers.splice(index, 1);
            this.mergedReceivers = [];
            this.mergedReceivers.push(...this.receivers);
            this.mergedReceivers.push(...this.ccReceivers);
            // this.fullNameCcReceivers.splice(index, 1);
        }
    }

    selectedCCReceiver(event: MatAutocompleteSelectedEvent): void {
        this.ccReceivers.push(event.option.value);
        this.searchCCReceiverInput.nativeElement.value = '';
        this.ccReceiverCtrl.setValue(null);
    }

    // handle bcc receiver part
    addBccReceiver(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();

        // create BCC receiver with only email
        const receiver = {
            accountId: null,
            name: null,
            accountName: null,
            email: value,
            receiverId: null
        }

        // Add our fruit
        if (value) {
            this.bccReceivers.push(receiver);
        }

        // Clear the input value
        event.chipInput!.clear();

        this.bccReceiverCtrl.setValue(null);
    }

    removeBccReceiver(fruit: Receiver): void {
        const index = this.bccReceivers.indexOf(fruit);

        if (index >= 0) {
            this.bccReceivers.splice(index, 1);
        }
    }

    selectedBccReceiver(event: MatAutocompleteSelectedEvent): void {
        this.bccReceivers.push(event.option.value);
        this.searchBCCReceiverInput.nativeElement.value = '';
        this.bccReceiverCtrl.setValue(null);
    }

    // cancel remove upload file
    removeUploadFile(index: number) {
        const storages: StoragesMinDto = {
            accountId: this.account.id,
            storages: []
        }
        const item = this.newBoxEmailItem.attachmentList[index];
        const storage: StorageMinDto = {
            itemId: item.attachmentId,
            type: ItemTypeEnum.FILE,
            name: item.attachmentFileName,
            modified: new Date(),
            usedSpace: 0,
            ownerId: 0,
            ownerName: '',
            mimeType: '',
            extension: '',
            image: '',
            folderColor: '',
            itemCount: 0,
            tagColor: TagColorEnum.BLUE,
            path: '',
        }
        storages.storages.push(storage);

        this.deleteAttachments(storages, false);

    }

    deleteAttachments(attachments: StoragesMinDto, closeDialog: boolean) {
        this.spinner.show()
        this.subSink.sink = this.emailService.deleteAttachments(attachments).subscribe( response => {

            for (let index = 0; index < attachments.storages.length; index++) {
                const a = attachments.storages[index];
                for (let i = 0; i < this.newBoxEmailItem.attachmentList.length; i++) {
                    const e = this.newBoxEmailItem.attachmentList[i];
                    if(e.attachmentId === a.itemId) {
                        const reduceSize = this.newBoxEmailItem.attachmentList[i].attachmentFileSize;
                        this.newBoxEmailItem.attachmentList.splice(i, 1);
                        this.totalFileSize = this.totalFileSize - reduceSize;
                        this.totalStringSize = this.fileSizePipe.transform(this.totalFileSize);
                        if (this.newBoxEmailItem.attachmentList.length == 0) {
                            this.isAttachment = false;
                            this.attachmentListHeight = 0;
                        }
                    }

                }
            }

            this.spinner.hide();
            if(closeDialog) {
                this.dialogRef.close();
            }
        }, error => {
            this.spinner.hide();
            console.error('Error while delete attachment', error);
            this.matSnack.open('Error while delete attachment', error?.error?.message);
        });
    }

    contentChange(evt: any) {
        this.newBoxEmailItem.content[0].content = evt.html;
    }

    closeNewReplyEmail() {
        const confirmModal = this.matDialogService.open(ConfirmToSaveDraftEmailComponent, { panelClass: 'confirm-to-save-draft-email' });
        confirmModal.afterClosed().subscribe(res => {
            if (res.save) {
                this.saveDraftEmail();
            }
            if (res.save == false) {
                const attachments: StoragesMinDto = {
                    accountId: this.account.id,
                    storages: []
                }
                for (let i = 0; i < this.newBoxEmailItem.attachmentList.length; i++) {
                    const item = this.newBoxEmailItem.attachmentList[i];
                    const storage: StorageMinDto = {
                        itemId: item.attachmentId,
                        type: ItemTypeEnum.FILE,
                        name: item.attachmentFileName,
                        modified: new Date(),
                        usedSpace: 0,
                        ownerId: 0,
                        ownerName: '',
                        mimeType: '',
                        extension: '',
                        image: '',
                        folderColor: '',
                        itemCount: 0,
                        tagColor: TagColorEnum.BLUE,
                        path: '',
                    }
                    attachments.storages.push(storage);
                }

                this.deleteAttachments(attachments, true);
            }
        });
    }

    saveDraftEmail() {
        const newEmail: EmailDraftItem = {
            id: v4(),
            subject: this.newBoxEmailItem.subject,
            content: this.newBoxEmailItem.content,
            receivers: this.receivers,
            receiversCc: this.ccReceivers,
            receiversBcc: this.bccReceivers,
            attachmentList: this.newBoxEmailItem.attachmentList,
            status: EmailShowStatus.InVisible,
            date: new Date(),
        };
        this.saveDraft(newEmail);
    }

    saveDraft(email: EmailDraftItem) {
        // this.spinnerContent = 'Save a draft message';
                this.spinner.show();
                const emailData: EmailData = {
                    subject: email.subject,
                    body: JSON.stringify(email.content),
                    receivers: email.receivers,
                    receiversCc: email.receiversCc,
                    receiversBcc: email.receiversBcc,
                    attachmentList: email.attachmentList,
                    created: email.date,
                };
                this.emailService.saveEmailDraft(emailData).subscribe((emailSaved: EmailData) => {

                    const EmailInboxItem: EmailViewItem = {
                        id: emailSaved.id!,
                        subject: emailSaved.subject,
                        content: emailSaved.body,
                        attachmentList: emailSaved.attachmentList,
                        isNew: true,
                        senderId: emailSaved.createdBy?.id!,
                        sender: this.account.accountName,
                        senderUserName: this.account.fullName,
                        size: 0,
                        flag: '',
                        date: emailSaved.created,
                        invite: false,
                        inviteStatus: '',
                        receivers: emailSaved.receivers,
                        ccReceivers: emailSaved.receiversCc,
                        bccReceivers: emailSaved.receiversBcc,
                        chainCounter: 0,
                        chainParentID: emailSaved.chainId!,
                        inCopyCounter: 0,
                        showDetail: false,
                        showReceiversDetail: false,
                        checked: false,
                        star: false,
                        isRead: false,
                        readOn: undefined
                    };


                    // this.store.dispatch(addNewSentEmail({ emailItem: EmailInboxItem }));
                    // this.store.dispatch(addSentEmailCounter());
                    this.spinner.hide();
                    this.dialogRef.close();
                }, error => {
                    console.error('Error while save draft', error);
                    this.matSnack.open('Error while save draft', error?.error?.message);
                    this.spinner.hide();
                });
    }

    sendMessage() {
        if(this.receivers.length === 0 && this.ccReceivers.length === 0) {
            this.matSnack.open(this.translateService.instant('EMAIL.destination_empty'), 'error');
            return;
        }
        this.spinner.show();

        const emailData: EmailData = {
            subject: this.newBoxEmailItem.subject,
            body: JSON.stringify(this.newBoxEmailItem.content),
            receivers: this.receivers,
            receiversCc: this.ccReceivers,
            receiversBcc: this.bccReceivers,
            attachmentList: this.newBoxEmailItem.attachmentList,
            created: new Date(),
            chainId: this.lastEmailInChain.chainId
        };
        this.emailService.sendNewEmail(emailData).subscribe(emailSaved => {

            const EmailInboxItem: EmailViewItem = {
                id: emailSaved.id!,
                subject: emailSaved.subject,
                content: emailSaved.body,
                attachmentList: [],
                isNew: true,
                senderId: emailSaved.createdBy?.id!,
                sender: this.account.accountName,
                senderUserName: this.account.fullName,
                size: 0,
                flag: '',
                date: emailSaved.created,
                invite: false,
                inviteStatus: '',
                receivers: emailSaved.receivers,
                ccReceivers: emailSaved.receiversCc,
                bccReceivers: emailSaved.receiversBcc,
                chainCounter: 0,
                chainParentID: emailSaved.chainId!,
                inCopyCounter: 0,
                showDetail: false,
                showReceiversDetail: false,
                checked: false,
                star: false,
                isRead: false,
                readOn: undefined
            };


            // this.store.dispatch(addNewSentEmail({ emailItem: EmailInboxItem }));
            this.emailHelper.loadEmailsCountForAccount();
            this.spinner.hide();
            window.location.reload();
        }, error => {
            console.error('Error while sending message', error);
            this.spinner.hide();
            this.matSnack.open('Error while sending message', error?.error?.message);
        });

    }

    sendScheduleMessage() {
        this.matDialogService.open(ScheduleEmailComponent);
    }

    setTestProgressValue() {
        setInterval(() => {
            if (this.progress < 100)
                this.progress = this.progress + 5;
        }, 200);
    }

    ChipListResized(flag: string, $event: ResizedEvent) {
        const chipListDiff = Math.round($event.newRect.height - 8);
        if ((chipListDiff % 31) > 20) {
            if (flag == 'cc')
                this.newCcChipListCreated = true;
            else if (flag == 'bcc')
                this.newBccChipListCreated = true;
            else
                this.newToChipListCreated = true;
        } else {
            if (flag == 'cc')
                this.newCcChipListCreated = false;
            else if (flag == 'bcc')
                this.newBccChipListCreated = false;
            else
                this.newToChipListCreated = false;
        }
    }

    focusInEmailToInput() {
        setTimeout(() => {
            this.isToGroupIcon = true;
        }, 300);
    }

    focusOutEmailToInput() {
        setTimeout(() => {
            if (!this.isToGroupRightMenu)
                this.isToGroupIcon = false;
        }, 300);
    }

    focusInEmailCcInput() {
        setTimeout(() => {
            this.isCcGroupIcon = true;
        }, 300);
    }

    focusOutEmailCcInput() {
        setTimeout(() => {
            if (!this.isCcGroupRightMenu)
                this.isCcGroupIcon = false;
        }, 300);
    }

    focusInEmailBccInput() {
        setTimeout(() => {
            this.isBccGroupIcon = true;
        }, 300);
    }

    focusOutEmailBccInput() {
        setTimeout(() => {
            if (!this.isBccGroupRightMenu)
                this.isBccGroupIcon = false;
        }, 300);
    }

    emailToRightMenuOpened() {
        this.isToGroupRightMenu = true;
    }

    emailToRightMenuClosed() {
        this.isToGroupRightMenu = false;
    }

    emailCcRightMenuOpened() {
        this.isCcGroupRightMenu = true;
    }

    emailCcRightMenuClosed() {
        this.isCcGroupRightMenu = false;
    }

    emailBccRightMenuOpened() {
        this.isBccGroupRightMenu = true;
    }

    emailBccRightMenuClosed() {
        this.isBccGroupRightMenu = false;
    }

    manageSignatures() {
        this.newBoxEmailItem.content[0].content = this.newBoxEmailItem.content[0].content + '<p>\n</p>';
        this.newBoxEmailItem.content[0].content = this.newBoxEmailItem.content[0].content + '<p>Jaime Del Burgo</p>';
        this.newBoxEmailItem.content[0].content = this.newBoxEmailItem.content[0].content + '<p>1 Herbert Mansion</p>';
        this.newBoxEmailItem.content[0].content = this.newBoxEmailItem.content[0].content + '<p>London</p>';
    }

    // private _filterReceivers(value: string): any {
    //     const filterValue = value.toLowerCase();
    //     return this.initialReceivers.filter(receiver => receiver.toLowerCase().includes(filterValue));
    // }

    displayName(receiver: Receiver) {
        return receiver.accountId ? receiver.accountName : receiver.email;
    }
}
