import { createAction, props } from '@ngrx/store';

export const setInCall = createAction('[ALO] Set in call ', props<{ inCall: boolean }>());
export const setModuleName = createAction('[ALO] Set allo as app');
