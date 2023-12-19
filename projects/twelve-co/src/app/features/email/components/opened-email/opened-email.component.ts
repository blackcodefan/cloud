import { DatabankService } from './../../../databank/services/databank.service';
import { TranslateService } from '@ngx-translate/core';
import { Receiver } from './../../model/receiver.model';
import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, OnDestroy } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { ResizedEvent } from 'angular-resize-event';
import { AccountSummary,  FileSizePipe, LoggingService, selectSelectedAccount } from 'core-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, filter, switchMap } from 'rxjs';
import { SubSink } from 'subsink';
import { v4 } from 'uuid';
import { BoxEmailContentItem, BoxEmailItem, EmailAttachment, EmailData, EmailRead, EmailReadStatus, Label } from '../../model';
import { EmailService } from '../../services/email.service';
import { ForwardEmailComponent } from '../forward-email/forward-email.component';
import { getSelectedLabel, setAsReadEmail } from '../../store';
import { FileSaverService } from 'ngx-filesaver';


@Component({
    selector: 'app-opened-email',
    templateUrl: './opened-email.component.html',
    styleUrls: [ './opened-email.component.scss' ],
})
export class OpenedEmailComponent implements OnInit, AfterViewInit, OnDestroy {

    @Input() paramVal: any;
    @Input() isReply!: boolean;
    @Output() isNewReply = new EventEmitter();
    @ViewChild('searchReceiverInput') searchReceiverInput!: ElementRef<HTMLInputElement>;
    @ViewChild('searchCCReceiverInput') searchCCReceiverInput!: ElementRef<HTMLInputElement>;
    @ViewChild('searchBccReceiverInput') searchBCCReceiverInput!: ElementRef<HTMLInputElement>;

    fileSizePipe = new FileSizePipe();
    separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
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
        sender: JSON.parse(localStorage.getItem('authData')!).email,
        senderUserName: JSON.parse(localStorage.getItem('authData')!).name,
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
    emailData: EmailData;
    totalFileSize = 0;
    totalStringSize: string = '';
    labelParam: 'draft' | 'inbox' | 'sent' | 'trash' | 'scheduled' | 'archived' | 'custom';
    label: Label | undefined;
    crtLabelName: string;
    timeOutID: any;

    private subSink = new SubSink();

    constructor(
        private dialogRef: MatDialogRef<ForwardEmailComponent>,
        private matDialogService: MatDialog,
        private emailService: EmailService,
        private store: Store<any>,
        private spinner: NgxSpinnerService,
        private matSnack: MatSnackBar,
        private translateService: TranslateService,
        private logger: LoggingService,
        private fileSaverService: FileSaverService
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
        this.subSink.sink = this.store.pipe(select(getSelectedLabel)).subscribe((label) => {
            this.label = label;
            this.crtLabelName = this.translateService.instant(label!.name);
            this.labelParam = this.emailService.getLabelCode(label!);
        });

        this.subSink.sink = this.store.pipe(select(selectSelectedAccount), filter(a => JSON.stringify(a) !== JSON.stringify({})))
            .subscribe((selectedAccount: AccountSummary) => {
                this.account = selectedAccount;

                this.newBoxEmailItem.sender = this.account.email;
                this.newBoxEmailItem.senderUserName = this.account.fullName;
            });
            console.log('paramVal', this.paramVal);

        this.spinner.show();
        this.subSink.sink = this.emailService.getEmailForId(this.paramVal.lastEmailInChainId).subscribe(email => {
            this.emailData = email;

            this.newBoxEmailItem.subject = this.emailData.subject;
            this.newBoxEmailItem.content = this.account.allowDecrypt ? JSON.parse(this.emailData.body) : this.emailData.body;
            // add receiver, but skip the current account, that replay
            this.receivers = this.emailData.receivers;
            this.ccReceivers = this.emailData.receiversCc;
            // clean receivers's id, because it will be new email
            this.receivers.forEach(x => x.receiverId = null);
            this.ccReceivers.forEach(x => x.receiverId = null);
            this.mergedReceivers.push(...this.receivers);
            this.mergedReceivers.push(...this.ccReceivers);
            // this.bccReceivers = this.lastEmailInChain.receiversBcc;

            if(!!this.emailData.attachmentList && this.emailData.attachmentList.length > 0) {
                this.newBoxEmailItem.attachmentList = this.emailData.attachmentList;
                for (let index = 0; index < this.newBoxEmailItem.attachmentList.length; index++) {
                    const a = this.newBoxEmailItem.attachmentList[index];
                    this.totalFileSize = this.totalFileSize + a.attachmentFileSize;
                }
                this.totalStringSize = this.fileSizePipe.transform(this.totalFileSize);
                this.newBoxEmailItem.attachment = true;
                this.isAttachment = true;
                this.attachmentListHeight = 216;
            }

            this.spinner.hide();
        }, error => {
            console.error('Error while loading last email in chain', error);
            this.matSnack.open('Error while loading last email in chain', error?.error?.message);
            this.spinner.hide();
        });

    }

    ngAfterViewInit() {
        // set email as read after 2 seconds
        this.timeOutID = setTimeout(() => {
            this.setEmailAsRead(true);
        }, 2000);
    }

    setEmailAsRead(isRead: boolean) {
        const readStatus: EmailReadStatus = {
            emailId: this.emailData.id!,
            isRead: isRead,
            emailLabelId: this.label!.id
        };

        this.subSink.sink = this.emailService.saveEmailReadStatus(readStatus).subscribe((res: EmailData) => {
            if (res != undefined) {
                const emailRead: EmailRead = {
                    emailId: res.id!,
                    isRead: res.readOn ? true: false,
                    readOn: res.readOn!
                };
                this.store.dispatch(setAsReadEmail({ emailRead }));
                // this.store.dispatch(decreaseNewEmailCounter());
            }
        }, error => {
            console.error('Error while set email as read', error);
            this.matSnack.open('Error while set email as read', error?.error?.message);
        });
    }

    ngOnDestroy(): void {
        clearTimeout(this.timeOutID);
        this.subSink.unsubscribe()
    }

    showFormattedDate(date: any) {
        return this.emailService.getViewableTime(date);
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
        if (receiver.email) {
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


    contentChange(evt: any) {
        this.newBoxEmailItem.content[0].content = evt.html;
    }

    closeOpenedEmail() {
        this.dialogRef.close();
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



    displayName(receiver: Receiver) {
        return receiver.accountId ? receiver.accountName : receiver.email;
    }

    onDownload(attachmentFile: EmailAttachment) {
        if (attachmentFile !== null) {
                this.spinner.show();
                this.emailService.downloadAttachment(attachmentFile.attachmentId).subscribe((res: Blob) => {
                    try {
                        this.spinner.hide();
                        this.fileSaverService.save(res, attachmentFile.attachmentFileName);
                    } catch (e) {
                        this.spinner.hide();
                        this.matSnack.open(`Error downloading attachment ${ e }`);
                    }

                }, error => {
                    this.matSnack.open(`Error downloading attachment ${ error?.error?.message || '' }`);
                    this.spinner.hide();
                });

        } else {
            this.spinner.hide();
            this.matSnack.open(`No attachment selected`);
        }
    }
}
