import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { SubSink } from 'subsink';
import { selectCurrentApplication, selectOwnerImage, selectSelectedAccount, State } from '../../store';
import {DomService,DashboardService, AccountSummary} from 'core-lib';
import {NgxSpinnerService} from "ngx-spinner";

@Component({
    selector: 'app-app-shell',
    templateUrl: './app-shell.component.html',
    styleUrls: [ './app-shell.component.scss' ],
})
export class AppShellComponent implements OnInit {

    pageTitle: string;
    username!: string;
    account: AccountSummary;
    isLogoButtons: boolean = false;
    isShowNotification: boolean = false;
    isEditApps: boolean = false;
    isDashboard: boolean = false;
    isLoading: boolean = false;
    ownerImage: string;
    isDashboardPreview: boolean = false;
    private subSink = new SubSink();

    constructor(
        private domService: DomService,
        private dashboardService: DashboardService,
        private store: Store<State>,
        private spinner: NgxSpinnerService,
        public router: Router) {
    }

    ngOnInit(): void {
        this.domService.getIsLoading().subscribe(res => {
            this.isLoading = res;
            if(this.isLoading) {
                this.spinner.hide();
                this.setAppBackground();
            } else {
                this.spinner.show();
            }
        })
        this.subSink.sink = this.store.pipe(select(selectOwnerImage)).subscribe(owner => this.ownerImage = owner);
        this.subSink.sink = this.store.pipe(select(selectSelectedAccount)).subscribe(selectedAccount => {
            this.username = selectedAccount.fullName;
            this.account = selectedAccount;
        });
        this.subSink.sink = this.store.pipe(select(selectCurrentApplication)).subscribe(cap => {
            this.pageTitle = cap;
        });
        this.dashboardService.getIsDashboardPreviewStatus().subscribe((status: boolean) => {
            this.isDashboardPreview = status;
        })
        this.isEditApps = false;
    }

    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }

    setAppBackground() {
        document.body.style.backgroundImage = "url(\"./assets/photo-1646071206496-0d8288613824.jpg\")";
    }

    showActionButton() {
        this.isLogoButtons = !this.isLogoButtons;
    }

    logout() {
        localStorage.clear();
        this.router.navigateByUrl('/login');
    }

    setNotificationStatus(b: boolean) {
        this.isShowNotification = b;
    }

    setIsDashboardPreviewStatus() {
        if(!this.isDashboardPreview)
            this.dashboardService.setIsDashboardPreviewStatus(true);
    }
}
