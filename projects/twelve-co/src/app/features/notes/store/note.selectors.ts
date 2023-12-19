import { createAction, createFeatureSelector, createSelector, props } from '@ngrx/store';
import { NoteState } from './note.store';

export const noteState = createFeatureSelector<NoteState>('noteStateKey');
