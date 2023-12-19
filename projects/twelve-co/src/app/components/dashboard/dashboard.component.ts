import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { AccountSummary, Contact, ContactItemInformationCategory, ContactsService, DashboardItem, DashboardResponse, DashboardService, DomService, User } from 'core-lib';
import { ElementQueries } from 'css-element-queries';
import { NgxSpinnerService } from 'ngx-spinner';
import { SubSink } from 'subsink';
import { selectAppList, selectDashboardPreview, selectSelectedSubscriber, setAppList } from '../../store';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: [ './dashboard.component.scss' ],
})
export class DashboardComponent implements OnInit, OnDestroy {
    selectectedAccount: AccountSummary;
    image: string;
    today = new Date();
    typeList = Array<any>();
    currentType: string;
    isSticky: boolean = false;
    isEditApps: boolean = false;
    tempAppList: Array<DashboardItem>;
    selectedApp: any;
    isAppSelected: Boolean = false;
    sortKey: string = 'OpenedDate';
    appItemList: any[];
    loading: Boolean = false;
    scroll: Boolean = false;
    flagList: Array<number>;
    todayDate: string;
    owner: User;
    metadata: any;
    isDashboardPreview: boolean;
    searchResult: Array<any> = [];
    sortApp: string = 'All';
    options: any;
    contacts: Array<Contact> = [];
    private subSink = new SubSink();
    ContactItemInformationCategory = ContactItemInformationCategory;

    constructor(private store: Store<any>, private router: Router, private dashboardService: DashboardService, private activatedRoute: ActivatedRoute,
                private domService: DomService, private spinner: NgxSpinnerService, private matSnack: MatSnackBar,
                private cdk: ChangeDetectorRef, private translateService: TranslateService, private contactsService: ContactsService) {
        console.debug('activated route ', this.activatedRoute.snapshot);
        this.typeList = [
            { viewValue: 'DASHBOARD.Communication', value: 'Communication' },
            { viewValue: 'DASHBOARD.Storage', value: 'Storage' },
            { viewValue: 'DASHBOARD.Genuine_Information', value: 'Genuine Information' },
            { viewValue: 'DASHBOARD.Content', value: 'Content' },
            { viewValue: 'DASHBOARD.Productivity', value: 'Productivity' },
            { viewValue: 'DASHBOARD.Social_Media', value: 'Social Media' },
            { viewValue: 'DASHBOARD.Finance', value: 'Finance' },
            { viewValue: 'DASHBOARD.Notary_Services', value: 'Notary Services' },
        ];
        this.currentType = this.typeList[0].value;
        this.options = {
            animation: 100,
            scrollSensitivity: 5,
            scroll: true,
            scrollSpeed: 100,
            onUpdate: (event: any) => {
                // console.log(event);
            },
        };
    }

    ngOnDestroy(): void {
        this.subSink.unsubscribe();
        this.domService.setIsLoading(false);
    }

    @HostListener('window:resize', [ '$event' ])
    onResize() {
        // this.setResponsiveAppList();
        this.setDashboardScroll();
    }

    ngOnInit(): void {
        const dashboard: DashboardResponse = this.activatedRoute.snapshot.data.dashboard;
        const appList = dashboard?.appList || [];
        this.store.dispatch(setAppList({ appList }));
        this.metadata = dashboard?.dashboardData;
        ElementQueries.listen();
        ElementQueries.init();
        this.appItemList = [];
        this.flagList = new Array<number>();
        this.subSink.sink = this.store.pipe(select(selectSelectedSubscriber)).subscribe(owner => this.owner = owner);
        this.dashboardService.getIsDashboardPreviewStatus().subscribe(res => {
            this.isDashboardPreview = res;
        });
        this.store.pipe(select(selectDashboardPreview)).subscribe(res => {
            const dashboardContainer = document.getElementById('12co-dashboard-container') as HTMLElement;
            const appList = document.getElementById('_12co-app-list') as HTMLElement;
            if (dashboardContainer) {
                if (this.isDashboardPreview) {
                    if (dashboardContainer.offsetWidth == 1612) {
                        appList.style.gridTemplateColumns = '300px 300px 300px';
                    }
                    if (dashboardContainer.offsetWidth == 1296 || dashboardContainer.offsetWidth == 980) {
                        appList.style.gridTemplateColumns = '300px 300px';
                    }
                    dashboardContainer.style.width = (dashboardContainer.offsetWidth - 632) + 'px';
                } else {
                    if (dashboardContainer.offsetWidth == 980) {
                        appList.style.gridTemplateColumns = '300px 300px 300px 300px 300px';
                    }
                    if (dashboardContainer.offsetWidth == 664) {
                        appList.style.gridTemplateColumns = '300px 300px 300px 300px';
                    }
                    dashboardContainer.style.width = (dashboardContainer.offsetWidth + 632) + 'px';
                }
            }
        });
        this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
            this.typeList = [
                { viewValue: 'DASHBOARD.Communication', value: 'Communication' },
                { viewValue: 'DASHBOARD.Storage', value: 'Storage' },
                { viewValue: 'DASHBOARD.Genuine_Information', value: 'Genuine Information' },
                { viewValue: 'DASHBOARD.Content', value: 'Content' },
                { viewValue: 'DASHBOARD.Productivity', value: 'Productivity' },
                { viewValue: 'DASHBOARD.Social_Media', value: 'Social Media' },
                { viewValue: 'DASHBOARD.Finance', value: 'Finance' },
                { viewValue: 'DASHBOARD.Notary_Services', value: 'Notary Services' },
            ];
            this.currentType = this.typeList[0].value;
        });

        this.subSink.sink = this.store.pipe(select(selectAppList)).subscribe(appList => {
            this.appItemList = appList;
            this.tempAppList = appList;
        });
        this.getTodayDate();
        this.findMembersInMyContacts();
    }


    ngAfterViewInit() {
        setTimeout(() => {
            this.loading = true;
            this.domService.setIsLoading(true);
            // this.setResponsiveAppList();
            this.setDashboardScroll();
        }, 1000);
    }

    dashboardHasScroll() {
        const emailChainList = this.domService.getElementByID('_12co-app-list') as HTMLElement;
        return emailChainList?.scrollHeight > emailChainList?.clientHeight;
    }

    setDashboardScroll() {
        this.scroll = this.dashboardHasScroll();
    }

    cancelApps() {
        this.isEditApps = false;
        this.sortApp = 'All';
        this.showSpinner();
    }

    saveApps() {
        this.showSpinner();
        const dashboardSettings = this.filterKeys(this.tempAppList, [ 'id', 'disabled' ]);
        this.dashboardService.saveDashboardSettingsForAccount(dashboardSettings).subscribe((apps: Array<DashboardItem>) => {
            this.store.dispatch(setAppList({ appList: apps }));
            this.isEditApps = false;
            this.matSnack.open('Apps saved succesfully');
        }, error => {
            this.matSnack.open('Error savingapp state');
            this.isEditApps = false;
        });

    }

    showSpinner() {
        this.spinner.show();
        this.loading = false;
        this.isEditApps = false;
        setTimeout(() => {
            this.loading = true;
            this.spinner.hide();
        }, 500);
    }

    addApp(id: any) {
        const appItem = this.tempAppList.find((x: any) => x.id == id);
        appItem!.disabled = false;
    }

    removeApp(id: any) {
        const appItem = this.tempAppList.find((x: any) => x.id == id);
        appItem!.disabled = true;
    }

    selectApp(item: any) {
        this.selectedApp = item;
        this.isAppSelected = true;
    }


    manageApps() {
        this.tempAppList = JSON.parse(JSON.stringify(this.appItemList));
        this.isEditApps = true;
        this.isAppSelected = false;
    }

    closePreviewBox() {
        this.selectedApp = null;
        this.isAppSelected = false;
    }

    getTodayDate() {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const monthList = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
        this.todayDate = day + ' ' + monthList[month] + ' ' + year;
    }

    setAppStatus(item: DashboardItem, $event: MatSlideToggleChange) {
        const currentItem = this.tempAppList.find((x: DashboardItem) => x.id == item.id);
        currentItem!.disabled = !$event.checked;

    }

    setIsDashboardPreviewStatus(dashboardPreview: boolean) {
        this.dashboardService.setIsDashboardPreviewStatus(false);
        //this.store.dispatch(setDashboardPreview({ dashboardPreview }));
    }

    discard($event: MouseEvent) {
        $event.preventDefault();
    }

    private filterKeys(data: any, keys: Array<string>): any {
        return data.map(dataItem => {
            return Object.keys(dataItem)
                .filter(key => keys.includes(key))
                .reduce((cur, key) => {
                    return Object.assign(cur, { [key]: dataItem[key] });
                }, {});
        });
    }

    findMembersInMyContacts() {
        this.subSink.sink = this.contactsService.findMembersInMyContacts().subscribe(list => {
            this.contacts = list;
        }, error => {
            this.matSnack.open('Error on loading contacts members.');
        });
    }

    getContactOptions(contact: Contact) {
        return contact.optionList.filter(x => x.category === ContactItemInformationCategory.EMAIL)
    }
}
