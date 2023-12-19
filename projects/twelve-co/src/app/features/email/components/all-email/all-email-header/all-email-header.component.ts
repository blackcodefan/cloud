import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { NewEmailComponent } from '../../new-email/new-email.component';
import { HttpResponse } from '@angular/common/http';
import { EmailService } from '../../../services/email.service';
import { NewLabelComponent } from '../../new-label/new-label.component';
import { EmailViewItem } from '../../../model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SubSink } from 'subsink';
import { AccountSummary, selectSelectedAccount } from 'core-lib';
import { filter } from 'rxjs';

@Component({
    selector: 'app-all-email-header',
    templateUrl: './all-email-header.component.html',
    styleUrls: ['./all-email-header.component.scss'],
})
export class AllEmailHeaderComponent implements OnInit, OnDestroy {
    private spinner: any;
    private spinnerContent: string;
    private subSink = new SubSink();

    account: AccountSummary;

    constructor(
        private matDialogService: MatDialog,
        private emailService: EmailService,
        private store: Store<any>,
        private matSnack: MatSnackBar
    ) {}

    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }

    ngOnInit(): void {
        this.subSink.sink = this.store
            .pipe(
                select(selectSelectedAccount),
                filter((a) => JSON.stringify(a) !== JSON.stringify({}))
            )
            .subscribe((selectedAccount: AccountSummary) => {
                this.account = selectedAccount;
            });
    }

    createNewLabel() {
        this.matDialogService.open(NewLabelComponent, {
            panelClass: 'new-label',
        });
    }

    composeEmail() {
        const currentDialogRef = this.matDialogService.open(NewEmailComponent, {
            panelClass: 'new-email',
            data: {
                edit: false,
            },
        });
    }

    showSearchBar() {
        console.log('display search header');
        this.emailService.setSearchInboxStatus(true);
    }
}
