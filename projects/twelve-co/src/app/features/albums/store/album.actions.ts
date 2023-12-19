import { createAction, props } from '@ngrx/store';
import { albumCatItem, AlbumItem, MediaItem } from '../model';

export const setModuleName = createAction('[album] Set module name', props<{ moduleName: string }>());
export const addNewAlbumCat = createAction('[Album] Add new album category', props<{album: albumCatItem}>());
export const setAlbumList = createAction('[Album List] Set Album List', props<{albumList: Array<AlbumItem>}>())
export const setMediaCounter = createAction('[Album List] Set Media Counter', props<{ counter: number }>());
export const setAlbumID = createAction('[Album List] Set Album ID', props<{ albumID: string }>());
export const removeAlbumByID = createAction('[Album List] Remove Album By ID', props<{ albumID: string }>());
export const addNewMedia = createAction('[Album List] Add New Media', props<{ mediaItem: MediaItem, albumID: string }>());

export type  AlbumActions = ReturnType<typeof setModuleName>;
