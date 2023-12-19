import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from '../../../store';
import { excelStateKey } from '../constants';
import { ExcelState } from './excel.store';

export const appState = createFeatureSelector<State>('appStateKey');
export const excelState = createFeatureSelector<ExcelState>(excelStateKey);
export const selectSelectedAccount = createSelector(appState, (state) => state.selectedAccount);
