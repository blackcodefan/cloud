import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AccountSummary } from 'core-lib';
import { State } from '../../../store';
import { bytesToSize } from '../../databank/store';
import { albumCatItem, MediaItem } from '../model';
import { AlbumState } from './album.store';

export const appState = createFeatureSelector<State>('appStateKey');
export const albumState = createFeatureSelector<AlbumState>('albumsState');

export const selectSelectedAccount = createSelector(appState, (state: State): AccountSummary => {
    return state.selectedAccount;
});
export const selectSelectedAccountId = createSelector(selectSelectedAccount, (state: AccountSummary): number => {
    return state.id;
});

export const getMediaListByAlbumID = (albumID: string) => createSelector(albumState, (state: AlbumState) => {
    if (albumID != 'all')
        return state.albumList.find(x => x.id == albumID)!.mediaList;
    else {
        let mediaList = new Array<MediaItem>();
        state.albumList.forEach(albumItem => {
            if (albumItem.id != 'all')
                mediaList = mediaList.concat(albumItem.mediaList);
        });
        return mediaList;
    }
});
export const getAlbums = createSelector(albumState, (state: AlbumState) => {
    return state.albumList;
});
export const getAlbumCatList = createSelector(albumState, (state: AlbumState) => {
    const albumCatList = new Array<albumCatItem>();
    state.albumList.forEach(albumItem => {
        albumCatList.push({ _id: albumItem.id, name: albumItem.name, originalSize: albumItem.originalSize, size: bytesToSize(albumItem.originalSize), counter: albumItem.counter });
    });
    return albumCatList;
});
export const getAlbumCounter = createSelector(albumState, (state: AlbumState) => {
    return state.albumCounts;
});
export const getAlbumID = createSelector(albumState, (state: AlbumState) => {
    return state.albumID;
});
