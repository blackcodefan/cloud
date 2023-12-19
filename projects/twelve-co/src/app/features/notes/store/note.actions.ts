import { createAction, props } from '@ngrx/store';

export const setModuleName = createAction('[note] Update SingleBox Expand Status', props<{ moduleName: string }>());
export const addNote = createAction('[note] Add a note to the store', props<{ note: any }>());

export type  NoteActions = ReturnType<typeof setModuleName>;
