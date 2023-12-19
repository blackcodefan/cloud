import { Action, createReducer, on } from '@ngrx/store';
import { excelInitialState,  ExcelState } from './excel.store';

const excelReducers = createReducer(
    excelInitialState,
);

export function excelAppReducers(state: ExcelState, action: Action) {
    return excelReducers(state, action);
}
