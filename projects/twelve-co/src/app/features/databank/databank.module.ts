import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { CoreLibModule } from 'core-lib';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { environment } from 'projects/twelve-co/src/environments/environment';
import { SessionStorageService } from '../../services';
import { storageMetaReducer } from '../../storage-metareducer';
import {
    ActivityListComponent,
    BreadcrumbComponent,
    ChangePermissionComponent,
    DeleteBoxPopupComponent,
    DeleteItemsPopupComponent,
    DuplicationAlertComponent,
    DuplicationMultipleComponent,
    GetInfoComponent,
    ImageDetailComponent,
    InvitationListComponent,
    InvitePeopleComponent,
    ManageDataTagComponent,
    ManageTagListComponent,
    ManageTagsComponent,
    MediaPreviewComponent,
    MemberhsipRevokeComponent,
    MembersComponent,
    MembershipExpirationComponent,
    MoveToBoxinfoComponent,
    MoveToBoxlistComponent,
    MoveToComponent,
    MoveToCreateNewFolderComponent,
    NewTagComponent,
    PdfPreviewComponentComponent,
    RenameDataComponent,
    Search12coDatabankComponent,
    VersionsComponent,
} from './components';
import { DatabankPreviewBoxComponent } from './components/databank-preview/databank-preview-box/databank-preview-box.component';
import { DatabankPreviewFileComponent } from './components/databank-preview/databank-preview-file/databank-preview-file.component';
import { DatabankPreviewFolderComponent } from './components/databank-preview/databank-preview-folder/databank-preview-folder.component';
import { DatabankDetailHeaderComponent } from './components/n-storage/databank-detail/databank-detail-header/databank-detail-header.component';
import { DatabankDetailComponent } from './components/n-storage/databank-detail/databank-detail.component';
import { DatabankListHeaderComponent } from './components/n-storage/databank-list/databank-list-header/databank-list-header.component';
import { DatabankListComponent } from './components/n-storage/databank-list/databank-list.component';
import { DatabankRoutingModule } from './databank-routing.module';
import { DatabankComponent } from './databank.component';
import { DATABANK_CONFIG_TOKEN, DATABANK_LOCAL_STORAGE_KEY, DATABANK_STORAGE_KEYS } from './databank.tokens';
import { BackgroundImageDirective } from './directives/background-image.directive';
import { databankStateKey } from './models';
import { AccountDetailsPipe, IconFetcherPipe, ImageDownloaderPipe, ItemIconFetcherPipe, SortByBoxesPipe, SplitPathPipe } from './pipes';
import { FileNamePipe } from './pipes/file-name.pipe';
import { databankReducers } from './store';

export function getDatabankConfig(localStorageKey: string, storageService: SessionStorageService) {
    return { metaReducers: [ storageMetaReducer(localStorageKey, storageService) ] };
}


@NgModule({
    declarations: [
        InvitePeopleComponent, RenameDataComponent, ActivityListComponent, MoveToComponent,
        MoveToBoxlistComponent, MoveToBoxinfoComponent, DatabankComponent, MoveToCreateNewFolderComponent, SplitPathPipe, DeleteItemsPopupComponent,
        DeleteBoxPopupComponent, ManageTagsComponent, ManageTagListComponent, ManageDataTagComponent, ImageDetailComponent, GetInfoComponent, NewTagComponent,
        ManageTagsComponent, DuplicationAlertComponent, VersionsComponent, BreadcrumbComponent, InvitationListComponent, Search12coDatabankComponent,
        IconFetcherPipe, ItemIconFetcherPipe, SortByBoxesPipe, MembersComponent, PdfPreviewComponentComponent, MediaPreviewComponent, ImageDownloaderPipe,
        BackgroundImageDirective, DuplicationMultipleComponent, ChangePermissionComponent, MembershipExpirationComponent, MemberhsipRevokeComponent, FileNamePipe,
        AccountDetailsPipe, DatabankListComponent, DatabankListHeaderComponent, DatabankDetailHeaderComponent, DatabankDetailComponent, DatabankPreviewBoxComponent, DatabankPreviewFolderComponent,
        DatabankPreviewFileComponent,
    ],
    imports: [
        CommonModule,
        DatabankRoutingModule,
        PdfJsViewerModule,
        MatDialogModule,
        CoreLibModule.forChild(environment),
        TranslateModule.forChild(),
        StoreModule.forFeature(databankStateKey, databankReducers, DATABANK_CONFIG_TOKEN),
    ],
    providers: [
        {
            provide: DATABANK_LOCAL_STORAGE_KEY,
            useValue: 'databankStorage',
        },
        {
            provide: DATABANK_STORAGE_KEYS,
            useValue: [ 'databankStorageKey' ],
        },
        {
            provide: DATABANK_CONFIG_TOKEN,
            deps: [
                DATABANK_LOCAL_STORAGE_KEY,
                SessionStorageService,
            ],
            useFactory: getDatabankConfig,
        },
    ],

    exports: [
        ImageDetailComponent,
    ],
})
export class DatabankModule {
}
