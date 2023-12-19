import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { META_REDUCERS, MetaReducer, StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { RxStompConfig } from '@stomp/rx-stomp';
import { ToolbarService } from '@syncfusion/ej2-angular-documenteditor';
import {
    AnnotationService,
    BookmarkViewService,
    LinkAnnotationService,
    MagnificationService,
    NavigationService,
    PrintService,
    TextSearchService,
    TextSelectionService,
    ThumbnailViewService,
} from '@syncfusion/ej2-angular-pdfviewer';

import { AngularResizeEventModule } from 'angular-resize-event';
import { CoreLibModule } from 'core-lib';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { AvatarModule } from 'ngx-avatar';
import { DragToSelectModule } from 'ngx-drag-to-select';
import { FileSaverModule } from 'ngx-filesaver';
import { NgxMaskModule } from 'ngx-mask';
import { NgxQrcodeStylingModule } from 'ngx-qrcode-styling';
import { SortablejsModule } from 'ngx-sortablejs';
import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ROOT_LOCAL_STORAGE_KEY } from './app.tokens';
import {
    BlockchainCheckerComponent,
    DashboardComponent,
    EnrollNewDeviceComponent,
    ForgottenPasswordComponent,
    HomeComponent,
    LoginComponent,
    NotificationComponent,
    ReplaceDeviceComponent,
    UploadingDataComponent,
    UserSwitchAccountDialogComponent,
} from './components';
import { AppShellComponent } from './components/app-shell/app-shell.component';
import { LostDeviceComponent } from './components/lost-device/lost-device.component';
import { SearchButtonComponent } from './components/search-button/search-button.component';
import { stompConfig } from './config/stomp.config';
import { SessionStorageService, TokenInterceptorService } from './services';
import { storageMetaReducer } from './storage-metareducer';
import { reducers } from './store';
import { FilterArrayPipe } from './pipes/filter-array.pipe';
import {MatCardModule} from "@angular/material/card";
import {NgxSpinnerModule} from "ngx-spinner";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatButtonModule} from "@angular/material/button";

export function getMetaReducers(localStorageKey: string, storageService: SessionStorageService): MetaReducer<any> {
    return storageMetaReducer(localStorageKey, storageService);
}

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


// @ts-ignore
@NgModule({
    declarations: [
        AppComponent,
        NotificationComponent,
        LoginComponent,
        UserSwitchAccountDialogComponent,
        HomeComponent,
        BlockchainCheckerComponent,
        UploadingDataComponent,
        SearchButtonComponent,
        ForgottenPasswordComponent,
        EnrollNewDeviceComponent,
        ReplaceDeviceComponent,
        DashboardComponent,
        AppShellComponent,
        LostDeviceComponent,
        FilterArrayPipe,


    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CoreLibModule.forRoot(environment),
        FormsModule,
        AvatarModule,
        FileSaverModule,
        PdfJsViewerModule,
        AppRoutingModule,
        HttpClientModule,
        AngularResizeEventModule,
        NgxMaskModule.forRoot(),
        DragToSelectModule.forRoot(),
        SortablejsModule.forRoot({ animation: 150 }),

        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [ HttpClient ],
            },
        }),
        NgxQrcodeStylingModule,
        StoreModule.forRoot({ appStateKey: reducers }),
        MatNativeDateModule,
        !environment.production ? StoreDevtoolsModule.instrument() : [],
        MatCardModule,
        NgxSpinnerModule,
        MatExpansionModule,
        MatButtonModule,
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptorService,
            multi: true,
        },
        {
            provide: LocationStrategy,
            useClass: HashLocationStrategy,
        },
        { provide: ROOT_LOCAL_STORAGE_KEY, useValue: 'appState' },
        {
            provide: META_REDUCERS,
            deps: [ ROOT_LOCAL_STORAGE_KEY, SessionStorageService ],
            useFactory: getMetaReducers,
            multi: true,
        }, {
            provide: RxStompConfig,
            useValue: stompConfig,
        },

        LinkAnnotationService, BookmarkViewService, MagnificationService,
        ThumbnailViewService, ToolbarService, NavigationService, AnnotationService, TextSearchService, TextSelectionService, PrintService,
        SessionStorageService,
    ],
    bootstrap: [ AppComponent ],
    exports: [
        FilterArrayPipe,
    ],
})
export class AppModule {
}
