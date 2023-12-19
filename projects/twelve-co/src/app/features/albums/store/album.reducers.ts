import { Action, createReducer, on } from '@ngrx/store';
import { AlbumItem, MediaItem } from '../model';
import { addNewAlbumCat, removeAlbumByID, setAlbumID, setAlbumList, setModuleName } from './album.actions';
import { AlbumInitialState, AlbumState } from './album.store';

const albumReducer = createReducer(AlbumInitialState,
    on(setModuleName, (state: AlbumState, { moduleName }) => Object.assign({}, { ...state }, { moduleName })),
    on(addNewAlbumCat, (state: AlbumState, { album }) => {
        const albumItem: AlbumItem = {
            id: album._id,
            name: album.name,
            originalSize: 0,
            size: '0',
            counter: 0,
            mediaList: Array<MediaItem>(),
        };
        return Object.assign({}, state, { albumList: [ ...state.albumList, albumItem ] });
    }),
    on(setAlbumList, (state: AlbumState, { albumList }) => {
        return Object.assign({}, state, { albumList: albumList });
    }),
    on(setAlbumID, (state: AlbumState, { albumID }) => {
        return Object.assign({}, state, { albumID: albumID });
    }),
    on(removeAlbumByID, (state: AlbumState, { albumID }) => {
        return Object.assign({}, state, { albumList: state.albumList.filter(item => item.id != albumID), albumCounts: state.albumCounts - 1 });
    }),
);

export function albumReducers(state: AlbumState | undefined, action: Action) {
    return albumReducer(state, action);
}
