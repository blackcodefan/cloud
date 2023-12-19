import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AccountSummary, ItemDetails, Language, NotificationContent, UploadWrapper, User } from 'core-lib';
import { DashboardItem } from 'core-lib';
import { appStateKey, UserAndToken } from '../model';
import { AuthStatus, State } from './app.state';

export const appState = createFeatureSelector<State>(appStateKey);
export const aloState = createFeatureSelector<any>('calls'); // maps to alo state


export const selectAuthState = createSelector(appState, (state: State): AuthStatus => {
    return state.auth;
});


export const selectLanguages = createSelector(appState, (state: State): Array<Language> => {
    return state.languages;
});


export const selectAuthToken = createSelector(appState, (state: State): string => {
    return state.auth.token;
});

export const selectInvitations = createSelector(appState, (state: State): Array<NotificationContent> => state.invitations);
export const selectInvitationsCount = createSelector(appState, (state: State): number => state.invitations.length || 0);

export const selectAuthTokenAndCurrentUser = createSelector(appState, (state: State): UserAndToken => ({ authToken: state.auth.token, userId: state.selectedAccount?.id }));

export const selectAudioCallStatus = createSelector(appState, (state: State): boolean => {
    return false;
});
export const selectConferenceCallStatus = createSelector(appState, (state: State): boolean => {
    return false;
});

export const selectLangCode = createSelector(appState, (state: State): string => {
    return state.langCode;
});

export const selectSelectedSubscriberFullName = createSelector(appState, (state: State): string => {
    return `${ state.subscriber.firstName } ${ state.subscriber.lastName }`;
});

export const selectSelectedSubscriber = createSelector(appState, (state: State): User => {
    return state.subscriber;
});

export const selectCurrentApplication = createSelector(appState, (state: State): string => {
    return state.currentApp;
});
export const selectLoggedInState = createSelector(appState, (state: State): boolean => {
    return state?.loggedIn || false;
});
export const selectAccounts = createSelector(appState, (state: State): Array<AccountSummary> => {
    const out: Array<AccountSummary> = [];
    Object.keys(state.subaccounts).forEach((key: string) => out.push(state.subaccounts[parseInt(key, 10)]));
    return out;
});
export const selectSelectedAccount = createSelector(appState, (state: State): AccountSummary => {
    return state.selectedAccount;
});
export const selectOwnerImage = createSelector(appState, (state: State): string => {
    return state.ownerImage;
});
export const selectSubscriber = createSelector(appState, (state: State): User => {
    return state.subscriber;
});

export const selectDashboardPreview = createSelector(appState, (state: State): boolean => state.dashboardPreview);

export const selectAppList = createSelector(appState, (state: State): Array<DashboardItem> => state.appList);

export const selectSidebarOpenedStatus = createSelector(appState, (state: State) => state.sideBarOpened);
export const selectInCall = createSelector(appState, (state: any): boolean => state.inCall);
export const selectUploadState = createSelector(appState, (state: State): UploadWrapper => state.uploadingState);
export const selectCurrentFolder = createSelector(appState, (state: State): ItemDetails => state.currentFolder);
