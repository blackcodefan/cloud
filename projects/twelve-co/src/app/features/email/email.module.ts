import { ConfirmToDeleteLabelComponent } from './components/confirm-to-delete-label/confirm-to-delete-label.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { CoreLibModule } from 'core-lib';
import { environment } from '../../../environments/environment';
import { SessionStorageService } from '../../services';
import { storageMetaReducer } from '../../storage-metareducer';
import {
    AddMemberToCcChainComponent,
    ArchiveEmailListComponent,
    ConfirmToDeleteEmailComponent,
    ConfirmToSaveDraftEmailComponent,
    EmailChainListComponent,
    EmailDetailComponent,
    NewEmailComponent,
    NewLabelComponent,
    OpenedEmailComponent,
    ReplyEmailComponent,
    ScheduleEmailComponent,
} from './components';
import { EmailHomeComponent } from './email-home.component';
import { EmailChainListRightSidebarComponent, EmailLeftSidebarComponent, EmailRightSidebarComponent } from './layouts';
import { FilterSentEmailPipe, IsTodayPipe } from './pipes';
import { AvatarFetcherPipe } from './pipes/avatar-fetcher.pipe';
import { emailReducers } from './store';
import { EMAIL_CONFIG_TOKEN, EMAIL_LOCAL_STORAGE_KEY, EMAIL_STORAGE_KEYS, emailStateKey } from './store/email.token';
import { ForwardEmailComponent } from './components/forward-email/forward-email.component';
import { EmailsListComponent } from './components/emails-list/emails-list.component';
import { AllEmailComponent } from './components/all-email/all-email.component';
import { AllEmailHeaderComponent } from './components/all-email/all-email-header/all-email-header.component';
import { DisplayAuthenticityComponent } from './components/display-authenticity/display-authenticity.component';
import { DisplayChainAuthenticityComponent } from './components/display-chain-authenticity/display-chain-authenticity.component';

export function getDatabankConfig(localStorageKey: string, storageService: SessionStorageService) {
    return { metaReducers: [ storageMetaReducer(localStorageKey, storageService) ] };
}

export const routes: Routes = [
    {
        path: '',
        component: EmailHomeComponent,
        children: [
            {
                path: '',
                // redirectTo: 'emails-list/inbox',
                redirectTo: 'all',
                pathMatch: 'full',
            },
            {
                path: 'all',
                component: AllEmailComponent,
                data: {title: 'All Email'}
            },
            {
                path: 'archive-email',
                component: ArchiveEmailListComponent,
                data: { title: 'Blockmail Archive' },
            },
            {
                path: 'chain-email-list/:itemId',
                component: EmailChainListComponent,
            },
            {
                path: 'emails-list/:label',
                component: EmailsListComponent,
            },
        ],
    }
    ,

];

export const decls = [ EmailHomeComponent, ConfirmToSaveDraftEmailComponent, EmailChainListComponent, EmailChainListRightSidebarComponent,
    EmailDetailComponent, NewEmailComponent, ConfirmToDeleteEmailComponent, ReplyEmailComponent,
    OpenedEmailComponent, ScheduleEmailComponent, AddMemberToCcChainComponent,
    EmailRightSidebarComponent, EmailLeftSidebarComponent,NewLabelComponent, ConfirmToDeleteLabelComponent ];
export const pipes = [ IsTodayPipe, FilterSentEmailPipe, AvatarFetcherPipe ];

@NgModule({
    declarations: [
        ...decls, ...pipes, ForwardEmailComponent, EmailsListComponent,
        AllEmailComponent,
        AllEmailHeaderComponent,
        DisplayAuthenticityComponent,
        DisplayChainAuthenticityComponent
    ],
    imports: [
        CommonModule,
        CoreLibModule.forChild(environment),
        TranslateModule.forChild(),
        RouterModule.forChild(routes),
        StoreModule.forFeature(emailStateKey, emailReducers, EMAIL_CONFIG_TOKEN),
    ],
    providers: [
        {
            provide: EMAIL_LOCAL_STORAGE_KEY,
            useValue: 'emailStorage',
        },
        {
            provide: EMAIL_STORAGE_KEYS,
            useValue: [ 'emailStorageKey' ],
        },
        {
            provide: EMAIL_CONFIG_TOKEN,
            deps: [
                EMAIL_LOCAL_STORAGE_KEY,
                SessionStorageService,
            ],
            useFactory: getDatabankConfig,
        } ],
})
export class EmailModule {
}
