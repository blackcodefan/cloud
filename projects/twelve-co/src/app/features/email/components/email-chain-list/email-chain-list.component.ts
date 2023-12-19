import { TranslateService } from '@ngx-translate/core';
import { getLabels, getSelectedLabel, getEmailsList } from './../../store/email.selectors';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SubSink } from 'subsink';
import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { AccountSummary, DomService, selectSelectedAccount } from 'core-lib';
import { EmailChainListRightSidebarComponent } from '../../layouts';
import { EmailData, EmailRead, EmailReadStatus, EmailViewItem, Label } from '../../model';
import { EmailService } from '../../services/email.service';
import { removeEmail, setAppTitle, setAsReadEmail, setEmailsList } from '../../store';
import { filter, pipe } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ForwardEmailComponent } from '../forward-email/forward-email.component';
import { ConfirmToDeleteEmailComponent } from '../confirm-to-delete-email/confirm-to-delete-email.component';
import { NgxSpinnerService } from 'ngx-spinner';
import ElementQueries from 'css-element-queries/src/ElementQueries';
import { FileSaverService } from 'ngx-filesaver';

@Component({
    selector: 'app-email-chain-list',
    templateUrl: './email-chain-list.component.html',
    styleUrls: [ './email-chain-list.component.scss' ],
})
export class EmailChainListComponent implements OnInit, AfterViewInit, OnDestroy {

    @Output() closeEvent = new EventEmitter();
    labelList!: Array<Label>;
    loading: boolean = false;
    showAllDetail: boolean = true;
    userEmail: string;
    emailList: Array<EmailViewItem>;
    public replyEmailPreVal: any;
    isReply: boolean = false;
    account: AccountSummary;
    private subSink = new SubSink();
    labelParam: 'draft' | 'inbox' | 'sent' | 'trash' | 'scheduled' | 'archived' | 'custom';
    crtLabel: Label | undefined;
    crtLabelName: string;
    showMoveToAction = false;
    onDeleteVirtual: any;
    itemId: string; // can be emailId or chainId; if label is inbox this is chainId; else is email id


    constructor(
        private route: ActivatedRoute,
        private store: Store<any>,
        private matDialog: MatDialog,
        private emailService: EmailService,
        private domService: DomService,
        private spinner: NgxSpinnerService,
        private matSnack: MatSnackBar,
        private router: Router,
        private translateService: TranslateService,
        private fileSaverService: FileSaverService
    ) {
        this.emailList = new Array<EmailViewItem>();
        this.userEmail = JSON.parse(localStorage.getItem('authData')!).email;
    }

    ngOnInit(): void {
        this.store.select(getEmailsList).subscribe( list => {
            this.emailList = JSON.parse(JSON.stringify(list));
        });

        this.subSink.sink = this.store.pipe(select(getSelectedLabel)).subscribe((label) => {
            this.crtLabel = label;
            this.crtLabelName = this.translateService.instant(label!.name);
            this.labelParam = this.emailService.getLabelCode(label!);
            this.subSink.sink = this.store.select(pipe(getLabels)).subscribe((x: Array<Label>) => {

                switch(this.labelParam) {
                    case 'inbox': {
                        this.onDeleteVirtual = this.onTrashEmail;
                        this.labelList = x.filter(l => !l.isFixed);
                        this.showMoveToAction = true;
                        break;
                    }
                    case 'sent': {
                        this.onDeleteVirtual = this.onTrashEmail;
                        this.labelList = x.filter(l => !l.isFixed);
                        this.showMoveToAction = true;
                        break;
                    }
                    case 'draft': {
                        this.onDeleteVirtual = this.onDeleteEmail;
                        this.labelList =  [];
                        this.showMoveToAction = false;
                        break;
                    }
                    case 'trash': {
                        this.onDeleteVirtual = this.onDeleteEmail;
                        this.labelList = x.filter(l => !l.isFixed || l.name === 'EMAIL.Inbox');
                        this.showMoveToAction = true;
                        break;
                    }
                    case 'scheduled': {
                        this.onDeleteVirtual = this.onTrashEmail;
                        this.labelList =  [];
                        this.showMoveToAction = false;
                        break;
                    }
                    case 'archived': {
                        this.onDeleteVirtual = this.onDeleteEmail;
                        this.labelList =  [];
                        this.showMoveToAction = false;
                        break;
                    }
                    case 'custom': {
                        this.onDeleteVirtual = this.onTrashEmail;
                        this.labelList = x.filter(l => (!l.isFixed && l.name !== this.crtLabel?.name)|| l.name === 'EMAIL.Inbox');
                        this.showMoveToAction = true;
                        break;
                    }
                    default: {
                        this.matSnack.open('Wrong label parameter');
                        return;
                    }
                }
            });


            this.route.params.subscribe((x: any) => {
                this.itemId = x.itemId; // can be emailId or chainId
                this.subSink.sink = this.store.pipe(select(selectSelectedAccount), filter(a => JSON.stringify(a) !== JSON.stringify({})))
                .subscribe((selectedAccount: AccountSummary) => {
                    this.account = selectedAccount;
                    this.subSink.sink = this.store.pipe(select(getSelectedLabel)).subscribe((label) => {
                        this.emailList = [];
                        if(this.labelParam === 'inbox') {
                            this.loadChainEmails(this.itemId, label!);
                        } else {
                            this.loadSingleEmail(this.itemId, label!);
                        }
                  });
                });

            });

            this.emailService.getEmailDetailStatus().subscribe(status => {
                if (this.loading) {
                    if (status) {
                        this.showAllDetail = true;
                    } else {
                        this.showAllDetail = false;
                    }
                }
            });
            this.emailService.getReplyEmailPreObj().subscribe(res => {
                this.replyEmailPreVal = res;
                // console.log(this.replyEmailPreVal);
                this.loading = true;
            });

        });


    }

    loadChainEmails(chainId: string, label: Label) {
        const emailsTmp: Array<EmailViewItem> = [];
        this.subSink.sink = this.emailService.getChainEmailsForAccount(chainId, label!.id).subscribe( result => {
            if (result != undefined && result.content != undefined && result.content.length > 0) {
                const emailRes = result.content;
                const replyEmailVal = {
                    subject: emailRes[0].subject,
                    sender: emailRes[0].createdBy?.name,
                    senderName: emailRes[0].createdBy?.fullName,
                    chainParentID: emailRes[0].chainId,
                    lastEmailInChainId: emailRes[0].id
                };
                this.emailService.setReplyEmailPreObj(replyEmailVal);
                this.store.dispatch(setAppTitle({ appTitle: emailRes[0].subject }));
                for (let i = 0; i < emailRes.length; i++) {
                    const emailItem: EmailViewItem = {
                        id: emailRes[i].id!,
                        subject: emailRes[i].subject,
                        content: this.account.allowDecrypt ? JSON.parse(emailRes[i].body)[0].content : emailRes[i].body,
                        attachmentList: emailRes[i].attachmentList,
                        isNew: false,
                        senderId: emailRes[i].createdBy?.id!,
                        sender: emailRes[i].createdBy?.name!,
                        senderUserName: emailRes[i].createdBy?.fullName!,
                        size: 0,
                        flag: '',
                        date: emailRes[i].created,
                        invite: false,
                        inviteStatus: '',
                        chainCounter: emailRes.length,
                        chainParentID: emailRes[i].chainId!,
                        receivers: emailRes[i].receivers,
                        ccReceivers: emailRes[i].receiversCc,
                        bccReceivers: emailRes[i].receiversBcc,
                        inCopyCounter: emailRes[i].receiversCc.length,
                        showDetail: true,
                        showReceiversDetail: false,
                        checked: false,
                        star: false,
                        isRead: emailRes[i].readOn !== undefined ? true : false,
                        readOn: emailRes[i].readOn
                    };
                    console.log('contentu**** ', emailItem);
                    emailsTmp.push(emailItem);
                }
                this.loading = true;
                this.store.dispatch(setEmailsList({emailsList: emailsTmp}));
            }
        }, error => {
            console.error('Erorr while retrieve chain emails', error);
            this.matSnack.open('Error load chain', error?.error?.message);
        });

    }

    loadSingleEmail(emailId: string, label: Label) {
        const emailsTmp: Array<EmailViewItem> = [];
        this.subSink.sink = this.emailService.getEmailForId(emailId).subscribe(emailData => {
            if (emailData !== undefined && emailData !== null) {
                const replyEmailVal = {
                    subject: emailData.subject,
                    sender: emailData.createdBy?.name,
                    senderName: emailData.createdBy?.fullName,
                    chainParentID: emailData.chainId,
                    lastEmailInChainId: emailData.id
                };
                this.emailService.setReplyEmailPreObj(replyEmailVal);
                this.store.dispatch(setAppTitle({ appTitle: emailData.subject }));
                const emailItem: EmailViewItem = {
                    id: emailData.id!,
                    subject: emailData.subject,
                    content: this.account.allowDecrypt ? JSON.parse(emailData.body)[0].content : emailData.body,
                    attachmentList: emailData.attachmentList,
                    isNew: false,
                    senderId: emailData.createdBy?.id!,
                    sender: emailData.createdBy?.name!,
                    senderUserName: emailData.createdBy?.fullName!,
                    size: 0,
                    flag: '',
                    date: emailData.created,
                    invite: false,
                    inviteStatus: '',
                    chainCounter: 1,
                    chainParentID: emailData.chainId!,
                    receivers: emailData.receivers,
                    ccReceivers: emailData.receiversCc,
                    bccReceivers: emailData.receiversBcc,
                    inCopyCounter: emailData.receiversCc.length,
                    showDetail: true,
                    showReceiversDetail: false,
                    checked: false,
                    star: false,
                    isRead: emailData.readOn !== undefined ? true : false,
                    readOn: emailData.readOn
                };
                emailsTmp.push(emailItem);
                this.loading = true;
                this.store.dispatch(setEmailsList({emailsList: emailsTmp}));
            }
        }, error => {
            console.error('Error while loading email', error);
            this.matSnack.open('Error while loading email', error?.error?.message);
            this.spinner.hide();
        });
    }

    ngAfterViewInit() {
        this.domService.appendComponentToEmailRightSide(EmailChainListRightSidebarComponent, 'email-right-side-bar');
        ElementQueries.listen();
        ElementQueries.init();
        setTimeout(() => {
            this.domService.setIsLoading(true);
        }, 500);
    }

    ngOnDestroy() {
        this.subSink.unsubscribe();
        this.domService.setIsLoading(false);
    }

    closeOpenedEmail() {
        this.closeEvent.emit();
    }

    showFormattedDate(date: any) {
        return this.emailService.getViewableTime(date);
    }

    replyEmail() {
        this.isReply = true;
    }

    closeReplyEmail(event: any) {
        this.emailList.push(event);
        this.isReply = false;
    }

    reverseEmailDetailStatus(id: string) {
        let selectedEmail = this.emailList.find(x => x.id == id);
        selectedEmail!.showDetail = !selectedEmail!.showDetail;
    }

    reverseEmailReceiversDetailStatus(id: string) {
        let selectedEmail = this.emailList.find(x => x.id == id);
        selectedEmail!.showReceiversDetail = !selectedEmail!.showReceiversDetail;
    }

    onForward(emailItem: EmailViewItem) {
        if(!this.account.allowDecrypt) {
            this.matSnack.open(this.translateService.instant('TOOLTIP_ENCRYPT'), 'error');
            return;
        }
        const forwardEmailDialog = this.matDialog.open(ForwardEmailComponent, { panelClass: 'forward-email' });
        forwardEmailDialog.componentInstance.preVal = this.replyEmailPreVal;
        forwardEmailDialog.componentInstance.preVal.lastEmailInChainId = emailItem.id;
    }

    onDeleteEmail(emailItem: EmailViewItem) {
        const confirmDeleteEmail = this.matDialog.open(ConfirmToDeleteEmailComponent, { panelClass: 'confirm-to-delete-email' });
        confirmDeleteEmail.componentInstance.action = 'delete';
        confirmDeleteEmail.componentInstance.labelParam = this.labelParam;
        confirmDeleteEmail.componentInstance.gotoEmailList = false;
        confirmDeleteEmail.componentInstance.selectedEmailId = emailItem.id;
        confirmDeleteEmail.componentInstance.chainId = this.itemId;

    }

    onTrashEmail(emailItem: EmailViewItem) {
        const confirmDeleteEmail = this.matDialog.open(ConfirmToDeleteEmailComponent, { panelClass: 'confirm-to-delete-email' });
        confirmDeleteEmail.componentInstance.action = 'trash';
        confirmDeleteEmail.componentInstance.labelParam = this.labelParam;
        confirmDeleteEmail.componentInstance.gotoEmailList = false;
        confirmDeleteEmail.componentInstance.selectedEmailId = emailItem.id;
        confirmDeleteEmail.componentInstance.chainId = this.itemId;
    }

    setReadFlag(emailItem: EmailViewItem ) {
        const readStatus: EmailReadStatus = {
            emailId: emailItem.id,
            isRead: !emailItem.isRead,
            emailLabelId: this.crtLabel!.id
        };

        this.subSink.sink = this.emailService.saveEmailReadStatus(readStatus).subscribe((res: EmailData) => {
            if (res != undefined) {
                const emailRead: EmailRead = {
                    emailId: res.id!,
                    isRead: res.readOn ? true: false,
                    readOn: res.readOn!
                };
                this.store.dispatch(setAsReadEmail({ emailRead }));
            }
        }, error => {
            console.error('Error while set email as read', error);
            this.matSnack.open('Error while set email as read', error?.error?.message);
        });
    }

    onPrint(emailItem: EmailViewItem ) {
        this.subSink.sink = this.emailService.printEmailToPdf(emailItem.id).subscribe(result => {
            console.log('Message PDF created.');
            this.fileSaverService.save(result, 'email.pdf');

        }, (error: any) => {
            console.log('Error while print email', error);
            this.matSnack.open('Error while print email',  error);
        });
    }

    onMoveToLabel(emailItem: EmailViewItem, label: Label ) {
        this.subSink.sink = this.emailService.moveEmailToLabel(emailItem.id, label.id).subscribe((result) => {
            this.store.dispatch(removeEmail({ emailId: emailItem!.id }));
        }, error => {
            console.error('Error while move email to another label', error);
            this.matSnack.open('Error while move email to another', error?.error?.message);
        });

    }

    /**
     * check authenticity of email
     */
    onAuthenticityCheck(emailItem: EmailViewItem ) {
        if(!this.account.allowDecrypt) {
            this.matSnack.open(this.translateService.instant('TOOLTIP_ENCRYPT'), 'error');
            return;
        }
        this.subSink.sink = this.emailService.signEmailPdf(emailItem.id).subscribe((result) => {
            // const displayAuthenticityDialog = this.matDialog.open(DisplayAuthenticityComponent, { panelClass: 'display-authenticity' });
            // displayAuthenticityDialog.componentInstance.authenticityToken = result;
            console.log('Signed email PDF created.');
            this.fileSaverService.save(result, 'email_signed.zip');

        }, error => {
            console.error('Error while create signed email PDF', error);
            this.matSnack.open('Error while create signed email PDF', error?.error?.message);
        });

    }
}
