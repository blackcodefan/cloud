import { SubSink } from 'subsink';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { EmailViewItem, Label } from '../../../model';
import { EmailFilterFieldEnum, EmailSortDirEnum, EmailSortFieldEnum } from '../../../model/email-types.enum';
import { EmailService } from '../../../services/email.service';
import { getSelectedLabel, setEmailsList } from '../../../store';
import { AccountSummary, selectSelectedAccount } from 'core-lib';
import { filter } from 'rxjs';

@Component({
    selector: 'app-email-right-sidebar',
    templateUrl: './email-right-sidebar.component.html',
    styleUrls: ['./email-right-sidebar.component.scss'],
})
export class EmailRightSidebarComponent implements OnInit {
    private subSink = new SubSink();
    filter: string = 'All';
    sort: string = 'Date';
    sortMessage: string = 'Oldest';
    label: Label | undefined;
    account: AccountSummary;

    constructor(
        private emailService: EmailService,
        private router: Router,
        private store: Store<any>
    ) {}

    ngOnInit(): void {
        this.subSink.sink = this.store
            .pipe(select(selectSelectedAccount), filter((a) => JSON.stringify(a) !== JSON.stringify({})))
            .subscribe((selectedAccount: AccountSummary) => {
                this.account = selectedAccount;
                this.subSink.sink = this.store.pipe(select(getSelectedLabel)).subscribe((label) => {
                    this.label = label;
                });
            });
    }

    showSearchBar() {
        this.emailService.setSearchInboxStatus(true);
    }

    returnToLabels() {
        this.router.navigateByUrl('/apps/emails');
    }

    onFilter(filter: string) {
        this.filter = filter;
        this.loadAllEmails();
    }

    onSort(sort: string) {
        this.sort = sort;
        this.loadAllEmails();
    }

    onSortMessage(sortMessage: string) {
        this.sortMessage = sortMessage;
        this.loadAllEmails();
    }

    loadAllEmails() {
        let filterField: EmailFilterFieldEnum;

        if(this.filter === 'All') {
            filterField = EmailFilterFieldEnum.ALL;
        } else if(this.filter === 'Unread') {
            filterField = EmailFilterFieldEnum.UNREAD;
        } else if(this.filter === 'Starred') {
            filterField = EmailFilterFieldEnum.STARRED;
        } else if(this.filter === 'CircleMails') {
            filterField = EmailFilterFieldEnum.ATT;
        } else if(this.filter === 'ToMe') {
            filterField = EmailFilterFieldEnum.TO;
        }  else if(this.filter === 'CcMe') {
            filterField = EmailFilterFieldEnum.CC;
        }  else {
            filterField = EmailFilterFieldEnum.BCC;
        }

        let sortField: EmailSortFieldEnum;

        if(this.sort === 'Date') {
            sortField = EmailSortFieldEnum.DATETIME;
        } else if(this.sort === 'Size') {
            sortField = EmailSortFieldEnum.SIZE;
        } else if(this.sort === 'From') {
            sortField = EmailSortFieldEnum.FROM;
        } else {
            sortField = EmailSortFieldEnum.ATT;
        }

        let sortDir: EmailSortDirEnum;

        if(this.sortMessage === 'Oldest') {
            sortDir = EmailSortDirEnum.ASC;
        } else {
            sortDir = EmailSortDirEnum.DESC;
        }


        this.subSink.sink = this.emailService
            .getEmailForLabelFilteredSorted(this.label!.id, filterField, sortField, sortDir)
            .subscribe(
                (result) => {
                    const emailTmpList = new Array<EmailViewItem>();
                    for (let i = 0; i < result.content.length; i++) {
                        const emailSaved = result.content[i];
                        const emailInboxItem: EmailViewItem = {
                            id: emailSaved.id!,
                            subject: emailSaved.subject,
                            content: this.account.allowDecrypt
                                ? JSON.parse(emailSaved.body)
                                : emailSaved.body,
                            attachmentList: [],
                            isNew: true,
                            senderId: emailSaved.createdBy?.id!,
                            sender: emailSaved.createdBy!.name,
                            senderUserName: emailSaved.createdBy!.fullName,
                            size:
                                emailSaved.attachmentList !== undefined
                                    ? emailSaved.attachmentList?.length
                                    : 0,
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
                            readOn: emailSaved.readOn,
                        };
                        console.log('EmailInboxItem', emailInboxItem);
                        emailTmpList.push(emailInboxItem);
                    }
                    this.store.dispatch(
                        setEmailsList({ emailsList: emailTmpList })
                    );
                },
                (error) => {
                    console.error(
                        'Error while load email from ' + this.label?.name, error );
                }
            );
    }
}
