import { InjectionToken } from '@angular/core';
import { StoreConfig } from '@ngrx/store';
import { NoteState } from './note.store';
import { NoteActions } from './note.actions';

export const NOTE_STORAGE_KEYS = new InjectionToken<keyof NoteState[]>('noteStorageKey');
export const NOTE_LOCAL_STORAGE_KEY = new InjectionToken<string[]>('noteStorage');
export const NOTE_CONFIG_TOKEN = new InjectionToken<StoreConfig<NoteState, NoteActions>>('noteActions');
