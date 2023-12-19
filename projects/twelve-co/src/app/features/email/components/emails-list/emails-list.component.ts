import { EmailRead } from './../../model/email.model';
import { EmailHelper } from './../../services/email.helper';
import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit, Renderer2, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AccountSummary, DomService, selectSelectedAccount } from 'core-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { filter, pipe } from 'rxjs';
import { SubSink } from 'subsink';
import { EmailRightSidebarComponent } from '../../layouts';
import { EmailViewItem, Label, EmailReadStatus, EmailData } from '../../model';
import { EmailService } from '../../services/email.service';
import {
    getEmailsList,
    getLabels,
    getSelectedLabel,
    removeEmail,
    setAsReadEmail,
    setEmailsList,
} from '../../store';
import { ConfirmToDeleteEmailComponent } from '../confirm-to-delete-email/confirm-to-delete-email.component';
import { ForwardEmailComponent } from '../forward-email/forward-email.component';
import { OpenedEmailComponent } from '../opened-email/opened-email.component';
import { ReplyEmailComponent } from '../reply-email/reply-email.component';
import ElementQueries from 'css-element-queries/src/ElementQueries';
import { DisplayChainAuthenticityComponent } from '../display-chain-authenticity/display-chain-authenticity.component';


@Component({
    selector: 'app-emails-list',
    templateUrl: './emails-list.component.html',
    styleUrls: [ './emails-list.component.scss' ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailsListComponent implements OnInit, AfterViewInit, OnDestroy {
    labelParam: 'draft' | 'inbox' | 'sent' | 'trash' | 'scheduled' | 'archived' | 'custom';


    @ViewChild('emailListRightMenuHandler', {
        read: MatMenuTrigger,
        static: true,
    }) emailListRightMenuHandler!: MatMenuTrigger;
    contextMenuPosition: any = { x: '', y: '' };
    emailsList: MatTableDataSource<EmailViewItem>;
    selectedEmailID!: string;
    selectedFlagColor!: string;
    selectedEmailIsRead: boolean;
    flagColorList: Array<string>;
    // unsubscribe$: Subject<boolean> = new Subject();
    public searchStatus: boolean;
    displayedColumns: string[] = [ 'checkbox', 'sender', 'subject-content', 'attachment', 'date' ];
    selection = new SelectionModel<EmailViewItem>(true, []);
    private subSink = new SubSink();
    account: AccountSummary;
    searchParam: string;
    crtLabel: Label | undefined;
    crtLabelName: string;
    showTrashAction = true;
    labelList!: Array<Label>;
    showMoveToAction = false;


    constructor(
        private route: ActivatedRoute,
        private domService: DomService,
        private matDialog: MatDialog,
        private emailService: EmailService,
        private store: Store<any>,
        private matSnack: MatSnackBar,
        private router: Router,
        private renderer: Renderer2,
        private translateService: TranslateService,
        private spinner: NgxSpinnerService,
        private emailHelper: EmailHelper,
        private cdr: ChangeDetectorRef
    ) {
        this.selectedEmailIsRead = false;
        this.renderer.listen('window', 'click', (event: any) => {
            if (this.emailListRightMenuHandler != undefined && this.emailListRightMenuHandler.menuOpen) {
                this.emailListRightMenuHandler.closeMenu();
            }
        });

        this.emailsList = new MatTableDataSource<EmailViewItem>();
        this.flagColorList = new Array<string>();
        this.flagColorList.push('#39FF33');
        this.flagColorList.push('#33D4FF');
        this.flagColorList.push('#FF33F6');
        this.flagColorList.push('#ffa033');
    }

    ngOnInit() {

        this.route.params.subscribe((x: any) => {
            this.labelParam = x.label;



            this.subSink.sink = this.store.pipe(select(getSelectedLabel)).subscribe((label) => {
                this.crtLabel = label;
                this.crtLabelName = label!.name;
                this.subSink.sink = this.store.select(pipe(getLabels)).subscribe((xList: Array<Label>) => {
                    switch (this.labelParam) {
                        case 'inbox': {
                            this.labelList = xList.filter(l => !l.isFixed);
                            this.showMoveToAction = true;
                            break;
                        }
                        case 'sent': {
                            this.labelList = xList.filter(l => !l.isFixed);
                            this.showMoveToAction = true;
                            break;
                        }
                        case 'draft': {
                            this.labelList =  [];
                            this.showMoveToAction = false;
                            break;
                        }
                        case 'trash': {
                            this.showTrashAction = false;
                            console.log('showTrashAction', this.showTrashAction);

                            this.cdr.detectChanges();
                            this.cdr.markForCheck();
                            this.labelList = xList.filter(l => !l.isFixed || l.name === 'EMAIL.Inbox');
                            this.showMoveToAction = true;
                            break;
                        }
                        case 'scheduled': {
                            this.labelList =  [];
                            this.showMoveToAction = false;
                            break;
                        }
                        case 'archived': {
                            this.labelList =  [];
                            this.showMoveToAction = false;
                            break;
                        }
                        case 'custom': {
                            this.labelList = xList.filter(l => (!l.isFixed && l.name !== this.crtLabel?.name)|| l.name === 'EMAIL.Inbox');
                            this.showMoveToAction = true;
                            break;
                        }
                        default: {
                            this.matSnack.open('Wrong label parameter');
                            return;
                        }
                    }
                });

                this.subSink.sink = this.emailService.getSearchInboxStatus().subscribe(res => {
                    this.searchStatus = res;
                    this.cdr.detectChanges();
                    this.cdr.markForCheck();
                    console.log('display search email-list init', this.searchStatus);
                    if (this.searchStatus)
                        setTimeout(() => {
                            this.focusSearchElement();
                        }, 200);
                });

                this.subSink.sink = this.store.select(pipe(getEmailsList)).subscribe((emailsList: Array<EmailViewItem>) => {
                    this.emailsList.data = emailsList;
                    this.cdr.detectChanges();
                    this.cdr.markForCheck();
                });
                this.subSink.sink = this.store.pipe(select(selectSelectedAccount), filter(a => JSON.stringify(a) !== JSON.stringify({})))
                    .subscribe((selectedAccount: AccountSummary) => {
                        this.account = selectedAccount;
                        this.loadAllEmails();
                    });

            });


        });
    }

    ngAfterViewInit() {
        // this.domService.getElementByID('inboxEmailCounter').style.display = 'flex';
        this.domService.appendComponentToEmailRightSide(EmailRightSidebarComponent, 'email-right-side-bar');

        ElementQueries.listen();
        ElementQueries.init();
        setTimeout(() => {
            this.domService.setIsLoading(true);
        }, 1000);
    }

    focusSearchElement() {
        console.log('display search email-list', this.searchStatus);

        const searchInput = document.getElementById('search') as HTMLInputElement;
        searchInput?.select();
        searchInput?.focus();
    }

    loadAllEmails() {
        this.subSink.sink = this.emailService.getEmailForLabel(this.crtLabel!.id).subscribe(result => {

            const emailTmpList = new Array<EmailViewItem>();
            for (let i = 0; i < result.content.length; i++) {
                const emailSaved = result.content[i];
                const emailInboxItem: EmailViewItem = {
                    id: emailSaved.id!,
                    subject: emailSaved.subject,
                    content: this.account.allowDecrypt ? JSON.parse(emailSaved.body) : emailSaved.body,
                    attachmentList: [],
                    isNew: true,
                    senderId: emailSaved.createdBy?.id!,
                    sender: emailSaved.createdBy!.name,
                    senderUserName: emailSaved.createdBy!.fullName,
                    size: emailSaved.attachmentList !== undefined ? emailSaved.attachmentList?.length : 0,
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
                    isRead: !!emailSaved.readOn ? true : false,
                    readOn: emailSaved.readOn
                };
                console.log('EmailInboxItem', emailInboxItem);
                emailTmpList.push(emailInboxItem);
            }
            this.store.dispatch(setEmailsList({ emailsList: emailTmpList }));

        }, error => {
            console.error('Error while load email from ' + this.labelParam, error);

        });
    }

    searchEmails() {
        this.store.dispatch(setEmailsList({ emailsList: [] }));
        if(this.searchParam === undefined || this.searchParam === null || this.searchParam === '') {
            this.loadAllEmails();
        }
        this.subSink.sink = this.emailService.searchEmailsForLabel(this.crtLabel!.id, this.searchParam).subscribe(result => {

            const emailTmpList = new Array<EmailViewItem>();
            for (let i = 0; i < result.content.length; i++) {
                const emailSaved = result.content[i];
                const emailInboxItem: EmailViewItem = {
                    id: emailSaved.id!,
                    subject: emailSaved.subject,
                    content: this.account.allowDecrypt ? JSON.parse(emailSaved.body) : emailSaved.body,
                    attachmentList: [],
                    isNew: true,
                    senderId: emailSaved.createdBy?.id!,
                    sender: emailSaved.createdBy!.name,
                    senderUserName: emailSaved.createdBy!.fullName,
                    size: emailSaved.attachmentList !== undefined ? emailSaved.attachmentList?.length : 0,
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
                    isRead: !!emailSaved.readOn ? true : false,
                    readOn: emailSaved.readOn
                };
                console.log('EmailInboxItem', emailInboxItem);

                emailTmpList.push(emailInboxItem);
            }
            this.store.dispatch(setEmailsList({ emailsList: emailTmpList }));

        }, error => {
            console.error('Error while search email from ' + this.labelParam, error);

        });
    }

    showChainEmailList(emailItem: EmailViewItem, invite: boolean) {
        // if (!invite)
        if(this.labelParam === 'inbox') {//  if label is inbox parameter is chainId; else parameter is email id
            this.router.navigate([ '/apps/emails/chain-email-list/' + emailItem.chainParentID ]);
        } else {
            this.router.navigate([ '/apps/emails/chain-email-list/' + emailItem.id ]);
        }

    }

    showEmailListItemActionMenu(event: MouseEvent, emailID: string, flagColor: string, isRead: boolean) {
        console.log('emailId', emailID);
        console.log('isRead', isRead);

        event.preventDefault();
        this.selectedEmailID = emailID;
        this.selectedFlagColor = flagColor;
        this.selectedEmailIsRead = isRead;
        if (this.emailListRightMenuHandler.menuOpen) {
            this.emailListRightMenuHandler.closeMenu();
        }
        this.contextMenuPosition.x = `${ event.x }px`;
        this.contextMenuPosition.y = `${ event.y }px`;
        setTimeout(() => {
            this.emailListRightMenuHandler.openMenu();
            this.emailListRightMenuHandler.menu.focusFirstItem('mouse');
        }, 300);
    }


    setStarRed() {
        // this.subSink.sink = this.emailServiceMock.setStarRead(this.selectedEmailID).subscribe((res: any) => {
        //     if (res.body != undefined && res.body.success) {
        //         this.store.dispatch(setStarRedInBoxEmail({ emailID: this.selectedEmailID }));
        //     }
        //     if (res.body != undefined && !res.body.success) {
        //         alert(res.body.msg);
        //     }
        // });
    }

    setAsRead() {
        this.setReadFlag(true);
    }

    setAsUnRead() {
        this.setReadFlag(false);
    }

    setReadFlag(isRead: boolean) {
        const readStatus: EmailReadStatus = {
            emailId: this.selectedEmailID,
            isRead: isRead,
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
                // this.store.dispatch(decreaseNewEmailCounter());
            }
        }, error => {
            console.error('Error while set email as read', error);
            this.matSnack.open('Error while set email as read', error?.error?.message);
        });
    }

    setFlag(color: any) {
        // this.subSink.sink = this.emailServiceMock.setFlag(this.selectedEmailID, color).subscribe((res: any) => {
        //     if (res.body != undefined && res.body.success) {
        //         this.store.dispatch(setFlagInboxEmail({ emailID: this.selectedEmailID, color: color }));
        //         this.selectedFlagColor = color;
        //     }
        //     if (res.body != undefined && !res.body.success) {
        //         alert(res.body.msg);
        //     }
        // });
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.emailsList.data.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.emailsList.data.forEach(row => this.selection.select(row));
    }

    hideSearchInboxContainer() {
        this.emailService.setSearchInboxStatus(false);
    }

    ngOnDestroy() {
        if (this.domService.getElementByID('inboxEmailCounter')?.style) {
            this.domService.getElementByID('inboxEmailCounter').style.display = 'none';
        }

        // this.unsubscribe$.next(true);
        // this.unsubscribe$.complete();
        this.subSink.unsubscribe();
        this.domService.setIsLoading(false);
    }

    AcceptInvite(id: string) {
        // this.emailServiceMock.acceptInviteByID(id).subscribe((res: any) => {
        //     if (res.body != undefined && res.body.success) {
        //         this.store.dispatch(setInviteStatusInboxEmail({ emailID: id, inviteStatus: 'a' }));
        //     }
        //     if (res.body != undefined && !res.body.success) {
        //         alert(res.body.msg);
        //     }
        // });
    }

    RejectInvite(id: string) {
        // this.emailServiceMock.rejectInviteByID(id).subscribe((res: any) => {
        //     if (res.body != undefined && res.body.success) {
        //         this.store.dispatch(setInviteStatusInboxEmail({ emailID: id, inviteStatus: 'r' }));
        //         this.store.dispatch(removeInboxEmail({ emailID: id }));
        //     }
        //     if (res.body != undefined && !res.body.success) {
        //         alert(res.body.msg);
        //     }
        // });
    }

    onOpenEmail() {
        const selEmail = this.getSelectedEmail(this.selectedEmailID);
        if (selEmail != null) {
            console.log('selected email', selEmail);
            const openEmailDialog = this.matDialog.open(OpenedEmailComponent, { panelClass: 'reply-email' });
            openEmailDialog.componentInstance.paramVal = { lastEmailInChainId: selEmail.id };
        }

    }

    onReplyEmail() {
        const selEmail = this.getSelectedEmail(this.selectedEmailID);
        if (selEmail != null) {
            console.log('selected email', selEmail);
            if (!this.account.allowDecrypt) {
                this.matSnack.open(this.translateService.instant('TOOLTIP_ENCRYPT'), 'error');
                return;
            }
            this.emailService.getReplyEmailPreObj().subscribe(replyEmailPreVal => {
                const replyEmailDialog = this.matDialog.open(ReplyEmailComponent, { panelClass: 'reply-email' });
                replyEmailDialog.componentInstance.preVal = replyEmailPreVal;
                replyEmailDialog.componentInstance.preVal.lastEmailInChainId = selEmail.id;
            });
        }
    }

    onForwardEmail() {
        if (!this.account.allowDecrypt) {
            this.matSnack.open(this.translateService.instant('TOOLTIP_ENCRYPT'), 'error');
            return;
        }
        const selEmail = this.getSelectedEmail(this.selectedEmailID);
        if (selEmail != null) {
            console.log('selected email', selEmail);
            if (!this.account.allowDecrypt) {
                this.matSnack.open(this.translateService.instant('TOOLTIP_ENCRYPT'), 'error');
                return;
            }
            this.emailService.getReplyEmailPreObj().subscribe(replyEmailPreVal => {
                const forwardEmailDialog = this.matDialog.open(ForwardEmailComponent, { panelClass: 'forward-email' });
                forwardEmailDialog.componentInstance.preVal = replyEmailPreVal;
                forwardEmailDialog.componentInstance.preVal.lastEmailInChainId = selEmail.id;
            });

        }
    }

    onDeleteEmail() {
        const confirmDeleteEmail = this.matDialog.open(ConfirmToDeleteEmailComponent, { panelClass: 'confirm-to-delete-email' });
        confirmDeleteEmail.componentInstance.title = this.translateService.instant('EMAIL.delete_email_title');
        confirmDeleteEmail.componentInstance.action = 'delete';
        confirmDeleteEmail.componentInstance.labelParam = this.labelParam;
        confirmDeleteEmail.componentInstance.selectedEmailId = this.selectedEmailID;
        confirmDeleteEmail.componentInstance.gotoEmailList = true;
        // confirmDeleteEmail.afterClosed().subscribe(x => {
        //     if (x && x.action) {
        //         // this.spinnerContent = 'Removing a new message';
        //         this.spinner.show();
        //         this.subSink.sink = this.emailService.deleteEmail(this.selectedEmailID).subscribe(result => {
        //             this.matSnack.open('EMAIL.delete_success', 'info');
        //             this.spinner.hide();
        //             this.router.navigate([ '/apps/emails/emails-list/' + this.labelParam ]);
        //         }, error => {
        //             console.error('Error while deleting email', error);
        //             this.matSnack.open('EMAIL.delete_email_error', 'error');
        //             this.spinner.hide();
        //         });
        //     }
        // });
    }

    onTrashEmail() {
        const confirmDeleteEmail = this.matDialog.open(ConfirmToDeleteEmailComponent, { panelClass: 'confirm-to-delete-email' });
        confirmDeleteEmail.componentInstance.title = this.translateService.instant('EMAIL.trash_email_title');
        confirmDeleteEmail.componentInstance.action = 'trash';
        confirmDeleteEmail.componentInstance.labelParam = this.labelParam;
        confirmDeleteEmail.componentInstance.selectedEmailId = this.selectedEmailID;
        confirmDeleteEmail.componentInstance.gotoEmailList = true;
        // confirmDeleteEmail.afterClosed().subscribe(x => {
        //     if (x && x.action) {
        //         // this.spinnerContent = 'Removing a new message';
        //         this.spinner.show();
        //         this.subSink.sink = this.emailService.trashEmail(this.selectedEmailID).subscribe(result => {
        //             this.matSnack.open('EMAIL.delete_success', 'info');
        //             this.spinner.hide();
        //             this.router.navigate([ '/apps/emails/emails-list/' + this.labelParam ]);
        //         }, error => {
        //             console.error('Error while trash email', error);
        //             this.matSnack.open('EMAIL.trash_email_error', 'error');
        //             this.spinner.hide();
        //         });
        //     }
        // });
    }

    getSelectedEmail(emailId: string): EmailViewItem | null {
        for (let index = 0; index < this.emailsList.data.length; index++) {
            const x = this.emailsList.data[index];
            if (emailId === x.id) {
                return x;
            }
        }

        return null;
    }

    onMoveToLabel( label: Label ) {
        const emailItem = this.getSelectedEmail(this.selectedEmailID);
        this.subSink.sink = this.emailService.moveEmailToLabel(emailItem!.id, label.id).subscribe((result) => {
            this.store.dispatch(removeEmail({ emailId: emailItem!.id }));
        }, error => {
            console.error('Error while move email to another label', error);
            this.matSnack.open('Error while move email to another', error?.error?.message);
        });

    }

     /**
     * check authenticity of emails chain
     */
      onAuthenticityCheck( ) {
        if(!this.account.allowDecrypt) {
            this.matSnack.open(this.translateService.instant('TOOLTIP_ENCRYPT'), 'error');
            return;
        }
        const emailItem = this.getSelectedEmail(this.selectedEmailID);
        this.subSink.sink = this.emailService.verifyChainAuthenticity(emailItem!.chainParentID).subscribe((result) => {
            const displayAuthenticityDialog = this.matDialog.open(DisplayChainAuthenticityComponent, { panelClass: 'display-authenticity' });
            displayAuthenticityDialog.componentInstance.authenticityToken = result;
        }, error => {
            console.error('Error while check emails chain authenticity', error);
            this.matSnack.open('Error while check emails chain authenticity', error?.error?.message);
        });
    }
}
