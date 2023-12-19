import { Action, createReducer, MetaReducer, on } from '@ngrx/store';
import { UploadWrapper } from 'core-lib';
import { environment } from '../../environments/environment';
import { changeSideBarStatus } from '../features/contacts/store';
import { setInvitations } from '../features/databank/store';
import { appList as defaultAppList } from './app-data';
import {
    clearUploadQueue,
    loadSubaccounts,
    loadSubscriberAction,
    logInAction,
    logoutAction,
    removeUploadFromQueue,
    setAccountTypeAction,
    setAppList,
    setCallId,
    setCallsSummary,
    setCurrentApp,
    setCurrentFolder,
    setDashboardPreview,
    setInCall,
    setInvitation,
    setLangCodeAction,
    setLoggedInState,
    setOwnerImage,
    setSelectedAccount,
    setSelectedBox,
    setTokenAction,
    setUploadingItemAction,
} from './app.actions';
import { AppInitialState, emptyGlobalState, State } from './app.state';


export function reducers(state: State | undefined, action: Action) {

    const appReducer = createReducer(AppInitialState,
            on(logoutAction, (state) => {
                console.log('app logout in root state');
                console.log('app logout in root state -> ', emptyGlobalState);
                return Object.assign({}, emptyGlobalState);
            }),
            on(setTokenAction, (state, action) => ({ ...state, auth: { ...state.auth, token: action.authToken } })),
            on(setLangCodeAction, (state, prop) => ({ ...state, langCode: prop.langCode })),
            on(changeSideBarStatus, (state, { status }) => ({ ...state, sideBarOpened: status })),
            on(setOwnerImage, (state, { ownerImage }) => ({ ...state, ownerImage })),
            on(setLoggedInState, (state, prop) => ({ ...state, loggedIn: prop.loggedIn })),
            on(setInCall, (state: State, { inCall }) => ({ ...state, inCall })),
            on(setCallId, (state: State, { callId }) => ({ ...state, callId })),
            on(setAppList, (state: State, { appList }) => {
                const updatedAppList = appList.map((updatedValue) => {
                    const el = defaultAppList.find(defaultItem => defaultItem.id === updatedValue.id);
                    return { ...el, ...updatedValue };
                });
                return Object.assign({}, state, { appList: updatedAppList });
            }),
            on(setDashboardPreview, (state: State, { dashboardPreview }) => ({ ...state, dashboardPreview })),
            on(setSelectedBox, (state, { selectedBox }) => ({ ...state, currentBox: selectedBox })),
            on(setCurrentFolder, (state, { selectedFolder }) => ({ ...state, currentFolder: selectedFolder })),
            on(logInAction, (state, action) => ({
                ...state, auth: { ...state.auth, token: action.authToken, email: action.username, loggedIn: true },
            })),
            on(setCurrentApp, (state: State, { currentAppKey }) => Object.assign({}, state, { currentApp: currentAppKey })),
            on(setSelectedAccount, (state: State, action) => ({ ...state, selectedAccount: action.selectedAccount })),
            on(clearUploadQueue, (state: State) => ({ ...state, uploadingState: {} })),
            on(removeUploadFromQueue, (state: State, { notificationId }) => {
                console.log('removing from queue with id: ', notificationId);
                const uuid = notificationId;
                const copy: UploadWrapper = JSON.parse(JSON.stringify(state.uploadingState));
                delete copy[uuid];
                const uploadingState = Object.assign({}, copy);
                return Object.assign({}, state, { uploadingState });
            }),
            on(loadSubaccounts, (state, action) => ({ ...state, subaccounts: action.subaccounts })),
            on(loadSubscriberAction, (state: State, action) => ({ ...state, subscriber: action.subscriber })),
            on(setAccountTypeAction, (state: State, action) => ({ ...state, registrationAccountType: action.accountType })),
            on(setInvitation, (state: State, { invitation }) => Object.assign({}, state, { invitations: [ ...state.invitations, invitation ] })),
            on(setInvitations, (state: State, { invitations }) => ({ ...state, invitations: invitations })),
            on(setUploadingItemAction, (state: State, { item }) => {
                const uploadUUID = item.uuid;
                const uploadingState = Object.assign({}, state.uploadingState, { [uploadUUID]: item });
                return Object.assign({}, state, { uploadingState });
            }),
            on(setCallsSummary, (state: State, { callsSummary }) => {
                const audioCallState = Object.assign({}, state.audioCallState, { callsSummary });
                // return Object.assign({}, ...state, audioCallState);
                return Object.assign({}, state, { audioCallState });
            }),
        )
    ;
    return appReducer(state, action);
}

// export default reducers;
export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
