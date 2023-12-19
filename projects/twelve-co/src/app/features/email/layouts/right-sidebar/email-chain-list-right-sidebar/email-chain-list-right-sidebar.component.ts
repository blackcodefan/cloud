import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { AccountSummary, DomService, selectSelectedAccount } from 'core-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { filter } from 'rxjs';
import { ConfirmToDeleteEmailComponent } from '../../../components';
import { AddMemberToCcChainComponent } from '../../../components/add-member-to-chain/add-member-to-cc-chain.component';
import { ReplyEmailComponent } from '../../../components/reply-email/reply-email.component';
import { Label } from '../../../model';
import { EmailService } from '../../../services/email.service';
import { ForwardEmailComponent } from '../../../components/forward-email/forward-email.component';
import { getSelectedLabel } from '../../../store';

@Component({
    selector: 'app-email-chain-list-right-sidebar',
    templateUrl: './email-chain-list-right-sidebar.component.html',
    styleUrls: [ './email-chain-list-right-sidebar.component.scss' ],
})
export class EmailChainListRightSidebarComponent implements OnInit, OnDestroy {
    public isExpand = true;
    public loading = false;
    public replyEmailPreVal: any;
    public spinnerContent: any;
    private isReply: boolean | undefined;
    account: AccountSummary;
    selectedLabel: Label;

    private subSink = new SubSink();

    constructor(
        private matDialog: MatDialog,
        private emailService: EmailService,
        private router: Router,
        private spinner: NgxSpinnerService,
        private store: Store<any>,
        private matSnack: MatSnackBar,
        private translateService: TranslateService,
        private domService: DomService,
    ) {
    }


    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }

    ngOnInit(): void {
        this.subSink.sink = this.store.pipe(select(selectSelectedAccount), filter(a => JSON.stringify(a) !== JSON.stringify({})))
            .subscribe((selectedAccount: AccountSummary) => {
                this.account = selectedAccount;
                this.subSink.sink = this.store.pipe(select(getSelectedLabel)).subscribe((label) => {
                    this.selectedLabel = label!;
                });
            });
        this.emailService.getReplyEmailPreObj().subscribe(res => {
            this.replyEmailPreVal = res;
            console.log(this.replyEmailPreVal);
            this.loading = true;
        });
    }

    goBack() {
        const labelCode = this.emailService.getLabelCode(this.selectedLabel);
        this.domService.clearEmailRightSide();
        this.router.navigate([ '/apps/emails/emails-list/' + labelCode ]);
    }

    replyEmail() {
        if(!this.account.allowDecrypt) {
            this.matSnack.open(this.translateService.instant('TOOLTIP_ENCRYPT'), 'error');
            return;
        }
        const replyEmailDialog = this.matDialog.open(ReplyEmailComponent, { panelClass: 'reply-email' });
        replyEmailDialog.componentInstance.preVal = this.replyEmailPreVal;
    }

    forwardEmail() {
        if(!this.account.allowDecrypt) {
            this.matSnack.open(this.translateService.instant('TOOLTIP_ENCRYPT'), 'error');
            return;
        }
        const forwardEmailDialog = this.matDialog.open(ForwardEmailComponent, { panelClass: 'forward-email' });
        forwardEmailDialog.componentInstance.preVal = this.replyEmailPreVal;
    }

    addMember() {
        const addMemberDialog = this.matDialog.open(AddMemberToCcChainComponent, { panelClass: 'add-member' });
        addMemberDialog.componentInstance.chainId = this.replyEmailPreVal.chainParentID;
        addMemberDialog.componentInstance.emailId = this.replyEmailPreVal.lastEmailInChainId;
        addMemberDialog.componentInstance.account = this.account;
        addMemberDialog.componentInstance.label = this.selectedLabel;
    }

    setExpand() {
        this.isExpand = !this.isExpand;
        this.emailService.setEmailDetailStatus(this.isExpand);
    }

    removeChainEmail() {
        const confirmChainEmail = this.matDialog.open(ConfirmToDeleteEmailComponent, { panelClass: 'confirm-to-delete-email' });
        confirmChainEmail.afterClosed().subscribe(x => {
            if (x && x.action) {
                this.spinnerContent = 'Removing a new message';
                this.spinner.show();
                this.subSink.sink = this.emailService.deleteEmailChain(this.replyEmailPreVal.chainParentID).subscribe(result => {
                    this.matSnack.open('EMAIL.delete_success', 'info');
                    this.spinner.hide();
                    this.router.navigate(['/apps/emails/emails-list/inbox']);
                }, error => {
                    console.error('Error while deletting email chain', error);
                    this.matSnack.open(this.translateService.instant('EMAIL.delete_email_chain_error'), error?.error?.message);
                    this.spinner.hide();
                });
            }
        });
    }

    returnToLabels() {
        this.router.navigateByUrl('/apps/emails');
    }

}
