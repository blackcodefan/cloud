import { addFixedLabels, setSelectedLabel, setEmailCounts } from './../../../store/email.actions';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { AccountSummary, DomService, selectSelectedAccount } from 'core-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { filter, pipe, Subscription } from 'rxjs';
import { SubSink } from 'subsink';
import { NewEmailComponent, NewLabelComponent } from '../../../components';
import { EmailCounts, Label, LabelItem } from '../../../model';
import { EmailService } from '../../../services/email.service';
import { getEmailCounts, getLabels, removeLabel } from '../../../store';
import { EmailHelper } from '../../../services/email.helper';

@Component({
    selector: 'app-email-left-sidebar',
    templateUrl: './email-left-sidebar.component.html',
    styleUrls: [ './email-left-sidebar.component.scss' ],
})
export class EmailLeftSidebarComponent implements OnInit, OnDestroy {
    public pageLink!: string;
    public spinnerContent: any;
    public labelList!: Array<LabelItem>;
    public subscription!: Subscription;
    account: AccountSummary;
    private subSink = new SubSink();
    fixedLabels: Array<Label> = [];
    customLabels: Array<Label> = [];
    emailCounts: EmailCounts;

    constructor(
        private router: Router,
        private matDialogService: MatDialog,
        private emailService: EmailService,
        private spinner: NgxSpinnerService,
        private store: Store<any>,
        private domService: DomService,
        private emailHelper: EmailHelper
    ) {
        this.fixedLabels = [];
        this.subSink.sink = this.store.pipe(select(selectSelectedAccount), filter(a => JSON.stringify(a) !== JSON.stringify({})))
            .subscribe((selectedAccount: AccountSummary) => {
            this.account = selectedAccount;
            this.getFixedLabels();
            this.getCustomLabels();
            this.emailHelper.loadEmailsCountForAccount();
        });
    }

    ngOnInit(): void {
        this.pageLink = this.router.url;

        this.subscription = this.store.select(pipe(getLabels)).subscribe((x: any) => {
            this.labelList = x;

            // check emailnumbers
            this.subscription = this.store.select(pipe(getEmailCounts)).subscribe((eCounts: EmailCounts) => {
                this.emailCounts = eCounts;
                // this.domService.getElementByID('allSentEmailCounter').innerText = res.sentCount;
                // this.domService.getElementByID('allInboxEmailCounter').innerText = res.inboxCount;
                // this.domService.getElementByID('unreadInboxEmailCounter').innerText = res.newInboxCount;
                // if (res.sentCount != null)
                //     this.domService.getElementsByClassName('sentEmailCounter')[0].style.display = 'block';
                // if (res.inboxCount != null)
                //     this.domService.getElementsByClassName('inboxEmailCounter')[0].style.display = 'block';
                // if (!res.newInboxCount)
                //     this.domService.getElementsByClassName('inboxEmailCounter')[1].style.display = 'none';
                // else
                //     this.domService.getElementsByClassName('inboxEmailCounter')[1].style.display = 'block';
            });
        });
    }

    getFixedLabels() {
        this.subSink.sink = this.emailService.getFixedLabelsForAccount().subscribe(labels => {
            if(labels.length > 0) {
                this.fixedLabels = labels;
            } else {
                this.fixedLabels = [];
            }

            this.store.dispatch(addFixedLabels({labels: labels}));
        }, error => {
            console.error('Error while retrieve fixed label', error);
            this.fixedLabels = [];
        });
    }

    getCustomLabels() {
        this.subSink.sink = this.emailService.getLabelsForAccount().subscribe(labels => {
            this.customLabels = labels;
        }, error => {
            console.error('Error while retrieve custom label', error);
        })
    }

    getTotalEmailForLabel(labelId: string): number {
        let total = 0;
        for (let index = 0; index < this.emailCounts.labelsCount.length; index++) {
            const element = this.emailCounts.labelsCount[index];
            if(element.labelId === labelId) {
                total = element.emailNo;
            }
        }

        return total;
    }

    getTotalUnreadEmailForLabel(labelId: string): number {
        let total = 0;
        for (let index = 0; index < this.emailCounts.labelsCount.length; index++) {
            const element = this.emailCounts.labelsCount[index];
            if(element.labelId === labelId) {
                total = element.emailNoUnread;
            }
        }

        return total;
    }

    isFixedLabelsEmpty() {
        const fixLabelsEmpty = this.fixedLabels !== undefined ? this.fixedLabels.length > 0 : false;
        return fixLabelsEmpty;
    }


    goWelcome() {
        this.router.navigateByUrl('/apps');
    }

    composeEmail() {
        const currentDialogRef = this.matDialogService.open(NewEmailComponent,
            {
                panelClass: 'new-email',
                data: {
                    edit: false,
                },
            },
        );
        // currentDialogRef.afterClosed().subscribe(res => {
        //     if (res != undefined && !res.send) {
        //         this.spinnerContent = 'Save a draft message';
        //         this.spinner.show();
        //         const emailData: EmailData = {
        //             subject: res.data.subject,
        //             body: JSON.stringify(res.data.content),
        //             receivers: res.data.receivers,
        //             receiversCc: res.data.receiversCc,
        //             receiversBcc: res.data.receiversBcc,
        //             // attachmentList: any,
        //             created: res.data.date,
        //         };
        //         this.emailService.saveEmailDraft(emailData).subscribe((emailSaved: EmailData) => {

        //             const EmailInboxItem: EmailViewItem = {
        //                 id: emailSaved.id!,
        //                 subject: emailSaved.subject,
        //                 content: emailSaved.body,
        //                 attachmentList: [],
        //                 isNew: true,
        //                 sender: this.account.accountName,
        //                 senderUserName: this.account.fullName,
        //                 size: 0,
        //                 flag: '',
        //                 date: emailSaved.created,
        //                 invite: false,
        //                 inviteStatus: '',
        //                 receivers: emailSaved.receivers,
        //                 ccReceivers: emailSaved.receiversCc,
        //                 bccReceivers: emailSaved.receiversBcc,
        //                 chainCounter: 0,
        //                 chainParentID: emailSaved.chainId!,
        //                 inCopyCounter: 0,
        //                 showDetail: false,
        //                 showReceiversDetail: false,
        //                 checked: false,
        //                 star: false,
        //             };


        //             this.store.dispatch(addNewSentEmail({ emailItem: EmailInboxItem }));
        //             this.store.dispatch(addSentEmailCounter());
        //             this.spinner.hide();

        //         }, error => {
        //             console.error('Error while save draft', error);
        //             this.spinner.hide();
        //         });


        //         // this.emailServiceMock.sendNewEmail(res.data).subscribe((result: any) => {
        //         //     if (result instanceof HttpResponse) {
        //         //         const newInboxEmail = result.body.res;
        //         //         const EmailInboxItem: EmailViewItem = {
        //         //             id: newInboxEmail.uid,
        //         //             subject: newInboxEmail.subject,
        //         //             content: newInboxEmail.content,
        //         //             attachmentList: newInboxEmail.attachmentList,
        //         //             isNew: newInboxEmail.isNew,
        //         //             sender: newInboxEmail.sender,
        //         //             senderUserName: newInboxEmail.senderUserName,
        //         //             size: newInboxEmail.attachmentFileSize,
        //         //             flag: newInboxEmail.flag,
        //         //             date: newInboxEmail.date,
        //         //             invite: newInboxEmail.invite,
        //         //             inviteStatus: newInboxEmail.inviteStatus,
        //         //             receivers: newInboxEmail.receivers,
        //         //             ccReceivers: newInboxEmail.ccReceivers,
        //         //             bccReceivers: newInboxEmail.bccReceivers,
        //         //             chainCounter: newInboxEmail.chainsCounter,
        //         //             chainParentID: newInboxEmail.chainParentID,
        //         //             inCopyCounter: newInboxEmail.inCopyCounter,
        //         //             showDetail: false,
        //         //             showReceiversDetail: false,
        //         //             checked: false,
        //         //             star: false,
        //         //         };
        //         //         this.store.dispatch(addNewSentEmail({ emailItem: EmailInboxItem }));
        //         //         this.store.dispatch(addSentEmailCounter());
        //         //         this.spinner.hide();
        //         //     }
        //         // });
        //     }

        //     if (res != undefined && res.send) {
        //         this.spinnerContent = 'Sending a new message';
        //         this.spinner.show();
        //         const emailData: EmailData = {
        //             subject: res.data.subject,
        //             body: JSON.stringify(res.data.content),
        //             receivers: res.data.receivers,
        //             receiversCc: res.data.receiversCc,
        //             receiversBcc: res.data.receiversBcc,
        //             // attachmentList: any,
        //             created: res.data.date,
        //         };
        //         this.emailService.sendNewEmail(emailData).subscribe(emailSaved => {

        //             const EmailInboxItem: EmailViewItem = {
        //                 id: emailSaved.id!,
        //                 subject: emailSaved.subject,
        //                 content: emailSaved.body,
        //                 attachmentList: [],
        //                 isNew: true,
        //                 sender: this.account.accountName,
        //                 senderUserName: this.account.fullName,
        //                 size: 0,
        //                 flag: '',
        //                 date: emailSaved.created,
        //                 invite: false,
        //                 inviteStatus: '',
        //                 receivers: emailSaved.receivers,
        //                 ccReceivers: emailSaved.receiversCc,
        //                 bccReceivers: emailSaved.receiversBcc,
        //                 chainCounter: 0,
        //                 chainParentID: emailSaved.chainId!,
        //                 inCopyCounter: 0,
        //                 showDetail: false,
        //                 showReceiversDetail: false,
        //                 checked: false,
        //                 star: false,
        //             };


        //             this.store.dispatch(addNewSentEmail({ emailItem: EmailInboxItem }));
        //             this.store.dispatch(addSentEmailCounter());
        //             this.spinner.hide();

        //         }, error => {
        //             console.error('Error while sending message', error);
        //             this.spinner.hide();
        //         });
        //     }

        //     // if (res != undefined && !res.send) {
        //     //     this.store.dispatch(addNewDraftEmail({ emailItem: res.data }));
        //     // }
        // });
    }

    inboxEmail() {
        this.store.dispatch(setSelectedLabel({selectedLabel: this.fixedLabels[0]}));
        this.pageLink = '/apps/emails/inbox';
        this.router.navigate(['/apps/emails/emails-list/inbox']);
    }

    sentEmail() {
        this.store.dispatch(setSelectedLabel({selectedLabel: this.fixedLabels[2]}));
        this.pageLink = '/apps/emails/sent-email';
        this.router.navigate(['/apps/emails/emails-list/sent']);
    }

    draftEmail() {
        this.store.dispatch(setSelectedLabel({selectedLabel: this.fixedLabels[1]}));
        this.pageLink = '/apps/emails/draft-email';
        this.router.navigateByUrl('/apps/emails/emails-list/draft');
    }

    starredEmail() {
        this.pageLink = '/apps/emails/starred-email';
        this.router.navigateByUrl('/apps/emails/starred-email');
    }

    trashEmail() {
        this.store.dispatch(setSelectedLabel({selectedLabel: this.fixedLabels[4]}));
        this.pageLink = '/apps/emails/trash-email';
        this.router.navigateByUrl('/apps/emails/emails-list/trash');
    }


    archiveEmail() {
        this.store.dispatch(setSelectedLabel({selectedLabel: this.fixedLabels[5]}));
        this.pageLink = '/apps/emails/archive-email';
        this.router.navigateByUrl('/apps/emails/emails-list/archived');
    }

    scheduledEmail() {
        this.store.dispatch(setSelectedLabel({selectedLabel: this.fixedLabels[3]}));
        this.pageLink = '/apps/emails/scheduled-email';
        this.router.navigateByUrl('/apps/emails/emails-list/scheduled');
    }

    createNewLabel() {
        this.matDialogService.open(NewLabelComponent, { panelClass: 'new-label' });
    }

    ngOnDestroy() {
        if (this.subscription)
            this.subscription.unsubscribe();
    }


    removeLabel(id: string) {
        this.emailService.removeEmailLabel(id).subscribe((res: any) => {
            this.store.dispatch(removeLabel({ id: id }));
        });
    }

    reloadCurrentPage() {
        window.location.reload();
    }
}
