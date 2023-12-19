// calls state
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CallDataDto } from 'core-lib';
import { AudioCallState, State } from '../../../store';

export const appState = createFeatureSelector<State>('appStateKey');
export const selectAudioCallState = createSelector(appState, (state: State): AudioCallState => state.audioCallState);

export const selectSelectedUserId = createSelector(selectAudioCallState, (state: AudioCallState): number => state.selectedUser);
export const selectAccounts = createSelector(selectAudioCallState, (state: AudioCallState): Array<any> => state.accounts);
export const selectCallId = createSelector(selectAudioCallState, (state: AudioCallState): string => state.callId);
export const selectOtboundWindowCall = createSelector(selectAudioCallState, (state: AudioCallState): any => state.outboundWindowCall);
export const selectCallsSummary = createSelector(selectAudioCallState, (state: AudioCallState): CallDataDto => state.callsSummary);
export const selectInCall = createSelector(appState, (state: State): boolean => state.inCall);
export const selectAppMode = createSelector(appState, (state: State): 'databank' | 'mail' | 'alo' => state.currentApp);
