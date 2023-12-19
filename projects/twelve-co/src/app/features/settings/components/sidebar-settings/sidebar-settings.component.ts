import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';

@Component({
    selector: 'app-sidebar-settings',
    templateUrl: './sidebar-settings.component.html',
    styleUrls: [ './sidebar-settings.component.scss' ],
})
export class SidebarSettingsComponent implements OnInit {
    @ViewChild(MatAccordion) accordion!: MatAccordion;
    settingsOptionFc = new UntypedFormControl();
    settingsOptions: any[] = [
        { code: 'ACCOUNT', path: 'apps/settings/account', icon: 'manage_accounts', tooltip: 'manage.account' },
        { code: 'DEVICES', path: 'apps/settings/security', icon: 'smartphone', tooltip: 'security' },
        { code: 'PASSWORD', path: 'apps/settings/password', icon: 'vpn_key', tooltip: 'password' },
        { code: 'ADVERTISING', path: 'apps/settings/advertising', icon: 'ads_click', tooltip: 'advertising' },
        { code: 'PAYMENT', path: 'apps/settings/payment', icon: 'credit_card', tooltip: 'payment' } ];
    selectedScreen: string = 'INTERFACE';

    constructor(private cdk: ChangeDetectorRef) {
    }

    ngOnInit(): void {
    }

    handleChange(screenToShow: string) {
        console.log('clicked new setting ', screenToShow);
        this.selectedScreen = screenToShow;
        // this.onDifferentSetting.emit(this.selectedScreen);

    }
}
