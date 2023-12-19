import { Action, createReducer, on } from '@ngrx/store';
import { setModuleName } from './note.actions';
import { NoteInitialState, NoteState } from './note.store';

const noteReducer = createReducer(NoteInitialState,
    on(setModuleName, (state: NoteState, { moduleName }) => Object.assign({}, { ...state }, { moduleName })));


export function noteReducers(state: NoteState | undefined, action: Action) {
    return noteReducer(state, action);
}
