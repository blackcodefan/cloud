import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { CoreLibModule } from 'core-lib';
import { SessionStorageService } from '../../services';
import { storageMetaReducer } from '../../storage-metareducer';
import { AlbumsComponent } from './albums.component';
import { AlbumCounterComponent } from './components/album-counter/album-counter.component';
import { AlbumDetailComponent } from './components/album-detail/album-detail.component';
import { AlbumMembersComponent } from './components/album-members/album-members.component';
import { ConfirmToDeleteAlbumComponent } from './components/confirm-to-delete-album/confirm-to-delete-album.component';
import { NewAlbumComponent } from './components/new-album/new-album.component';
import { AlbumsLeftSidebarComponent, AlbumsRightSidebarComponent } from './layout';
import { ALBUM_CONFIG_TOKEN, ALBUM_LOCAL_STORAGE_KEY, ALBUM_STORAGE_KEYS, albumReducers } from './store';

export function getAlbumConfig(localStorageKey: string, storageService: SessionStorageService) {
    return { metaReducers: [ storageMetaReducer(localStorageKey, storageService) ] };
}


export const routes: Routes = [ {
    path: '',
    children: [
        {
            path: '',
            redirectTo: 'All',
            pathMatch: 'full',
        },
        {
            path: ':albumID',
            component: AlbumsComponent,
            data: { title: 'Albums' },
        },
    ],
} ];

@NgModule({
    declarations: [ AlbumsComponent, AlbumsLeftSidebarComponent, AlbumsRightSidebarComponent, ConfirmToDeleteAlbumComponent, NewAlbumComponent, AlbumMembersComponent, AlbumDetailComponent, AlbumCounterComponent ],
    imports: [
        CommonModule,
        CoreLibModule,
        TranslateModule.forChild(),
        RouterModule.forChild(routes),
        StoreModule.forFeature('albumsState', albumReducers),
    ],
    providers: [
        {
            provide: ALBUM_STORAGE_KEYS,
            useValue: 'albumStorage',
        },
        {
            provide: ALBUM_STORAGE_KEYS,
            useValue: [ 'albumStorageKey' ],
        },
        {
            provide: ALBUM_CONFIG_TOKEN,
            deps: [
                ALBUM_LOCAL_STORAGE_KEY,
                SessionStorageService,
            ],
            useFactory: getAlbumConfig,
        },
    ],
})
export class AlbumsModule {
}
