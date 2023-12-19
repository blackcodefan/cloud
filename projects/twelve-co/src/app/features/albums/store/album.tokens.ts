import { InjectionToken } from '@angular/core';
import { StoreConfig } from '@ngrx/store';
import { AlbumState } from './album.store';
import { AlbumActions } from './album.actions';

export const ALBUM_STORAGE_KEYS = new InjectionToken<keyof AlbumState[]>('albumStorageKey');
export const ALBUM_LOCAL_STORAGE_KEY = new InjectionToken<string[]>('albumStorage');
export const ALBUM_CONFIG_TOKEN = new InjectionToken<StoreConfig<AlbumState, AlbumActions>>('albumActions');
