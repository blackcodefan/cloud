import { InjectionToken } from '@angular/core';
import { StoreConfig } from '@ngrx/store';
import { EmailActions } from './email.actions';
import { EmailState } from './email.store';

export const EMAIL_STORAGE_KEYS = new InjectionToken<keyof EmailState[]>('emailStorageKey');
export const EMAIL_LOCAL_STORAGE_KEY = new InjectionToken<string[]>('emailStorage');
export const EMAIL_CONFIG_TOKEN = new InjectionToken<StoreConfig<EmailState, EmailActions>>('emailActions');
export const emailStateKey = 'emailState';
