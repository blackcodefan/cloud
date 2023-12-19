import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { DomService } from 'core-lib';
import { pipe } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { NewEmailComponent } from './components';
import { EmailDraftItem, EmailShowStatus } from './model';
import { changeEmailDisplayStatus, EmailState, getEmailDraftList, setAppTitle, updateDraftEmail, updateDraftEmailStatus } from './store';

@Component({
    selector: 'app-email-home',
    templateUrl: './email-home.component.html',
    styleUrls: [ './email-home.component.scss' ],
})
export class EmailHomeComponent implements OnInit, OnDestroy {
    emailDraftList!: Array<EmailDraftItem>;
    public loading: Boolean = false;
    selectedItem = 'Inbox';

    constructor(
        private domService: DomService,
        private store: Store<EmailState>,
        private matDialogService: MatDialog,
        public router: Router,
        public route: ActivatedRoute,
    ) {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            map(() => {
                const child = this.route.firstChild;
                if (child!.snapshot.data['title']) {
                    return child!.snapshot.data['title'];
                }
            }),
        ).subscribe((ttl: string) => {
            this.store.dispatch(setAppTitle({ appTitle: ttl }));
        });
    }

    ngOnInit() {
        // todo remove
        localStorage.setItem('authData', JSON.stringify({ _id: 1, email: 'jaimedelburgo@outlook.com' }));
        // !!!!!!!!!! remove
        const email = JSON.parse(localStorage.getItem('authData')!).email;
        const uid = JSON.parse(localStorage.getItem('authData')!)._id;

        this.store.select(pipe(getEmailDraftList)).subscribe((emailDraftList: Array<EmailDraftItem>) => {
            this.emailDraftList = emailDraftList;
        });
    }

    ngAfterViewInit() {
        // this.domService.appendComponentToSidebar(EmailLeftSidebarComponent);
        // this.domService.appendComponentToHeader(DatabankDetailHeaderComponent, '_12co-data-bank-header');
        // this.domService.appendComponentToHeader(EmailRightSidebarComponent, '_12co-app-email-right-sidebar')
    }

    maximizeEmail(emailID: string) {
        const currentEmail = this.emailDraftList.find(x => x.id == emailID);
        this.store.dispatch(updateDraftEmailStatus({ emailID: emailID, status: EmailShowStatus.ZoomIn }));
        const currentDialogRef = this.matDialogService.open(NewEmailComponent,
            {
                panelClass: 'new-email',
                data: {
                    edit: true,
                    emailContent: currentEmail,
                },
            },
        );
        currentDialogRef.afterClosed().subscribe(x => {
            this.store.dispatch(updateDraftEmail({ emailItem: x.data }));
        });
    }

    hideEmail(emailId: string) {
        this.store.dispatch(changeEmailDisplayStatus({ emailID: emailId, status: EmailShowStatus.InVisible }));
    }

    ngOnDestroy(): void {
        this.domService.clearComponentSidebar();
        this.domService.clearRightSideBar();
    }
}
