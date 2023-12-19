import { InjectionToken } from '@angular/core';
import { StoreConfig } from '@ngrx/store';
import { DatabankActions, DatabankState } from './store';

export const DATABANK_STORAGE_KEYS = new InjectionToken<keyof DatabankState[]>('databankStorageKey');
export const DATABANK_LOCAL_STORAGE_KEY = new InjectionToken<string[]>('databankStorage');
export const DATABANK_CONFIG_TOKEN = new InjectionToken<StoreConfig<DatabankState, DatabankActions>>('databankActions');
