import { AlbumItem } from '../model';

export interface AlbumState {
    moduleName: string;
    albumList: Array<AlbumItem>,
    albumCounts: number,
    albumID: string,
}


export const AlbumInitialState: AlbumState = {
    moduleName: 'albumModule',
    albumList: [],
    albumCounts: 0,
    albumID: '',
};
