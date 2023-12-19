import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CoreLibModule } from 'core-lib';
import { AccountComponent } from './components/account/account.component';
import { AdvertisingComponent } from './components/advertising/advertising.component';
import { PasswordComponent } from './components/password/password.component';
import { PaymentComponent } from './components/payment/payment.component';
import { SecurityComponent } from './components/security/security.component';
import { SessionsComponent } from './components/sessions/sessions.component';
import { SidebarSettingsComponent } from './components/sidebar-settings/sidebar-settings.component';
import { SettingsComponent } from './settings.component';

const routes = [
    {
        path: '', component: SettingsComponent,
        children: [
            { path: '', redirectTo: 'account' },
            { path: 'account', component: AccountComponent },
            { path: 'security', component: SecurityComponent },
            { path: 'password', component: PasswordComponent },
            { path: 'advertising', component: AdvertisingComponent },
            { path: 'sessions', component: SessionsComponent },
            { path: 'payment', component: PaymentComponent },
        ],

    },
];

@NgModule({
    declarations: [
        SettingsComponent,
        SidebarSettingsComponent,
        SecurityComponent,
        AdvertisingComponent,
        PaymentComponent,
        AccountComponent,
        PasswordComponent,
        SessionsComponent,
    ],
    imports: [
        CommonModule,
        CoreLibModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
    ],
})
export class SettingsModule {
}
