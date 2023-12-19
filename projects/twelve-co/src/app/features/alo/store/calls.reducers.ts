import { Action, createReducer, on } from '@ngrx/store';
import { setModuleName } from './calls.actions';
import { callsInitialState, CallsState } from './calls.state';

const calendarReducers = createReducer(
    callsInitialState,
    on(setModuleName, (state) => state),
);

export function aloAppReducers(state: CallsState, action: Action) {
    return calendarReducers(state, action);
}
