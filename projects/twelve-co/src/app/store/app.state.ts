import { AccountSummary, AccountTypeEnum, CallDataDto, ItemDetails, Language, NotificationContent, UploadWrapper, User } from 'core-lib';
import { appList, audioCallInitialState } from './app-data';

export interface State {
    subscriber: User;
    loggedIn: boolean;
    inCall: boolean;
    callId: string;
    currentApp: string;
    currentFolder: ItemDetails;
    currentBox: ItemDetails;
    selectedAccount: AccountSummary;
    languages: Array<Language>;
    auth: AuthStatus;
    subaccounts: { [key: number]: AccountSummary };
    langCode: string;
    registrationAccountType: AccountTypeEnum;
    uploadingState: UploadWrapper;
    sideBarOpened: boolean;
    invitations: Array<NotificationContent>;
    audioCallState: AudioCallState;
    dashboardPreview: boolean;
    ownerImage: string;
    appList: Array<any>;
}


// @ts-ignore
export const AppInitialState: State = {
    loggedIn: false,
    invitations: [],
    // @ts-ignore
    subscriber: null,
    currentApp: 'databank',
    dashboardPreview: false,

    // @ts-ignore
    selectedAccount: null,
    // @ts-ignore
    currentFolder: null,
    // @ts-ignore
    currentBox: null,
    languages: [],
    auth: { token: '', email: '', loggedIn: false },
    subaccounts: {},
    // @ts-ignore
    registrationAccountType: null,
    uploadingState: {},
    langCode: 'en',
    inCall: false,
    callId: '',
    // @ts-ignore
    ownerImage: null,
    sideBarOpened: true,
    appList: [],
};
// @ts-ignore
export const emptyGlobalState: State = {
    loggedIn: false,
    invitations: [],
    // @ts-ignore
    subscriber: null,
    currentApp: 'databank',
    // @ts-ignore
    selectedAccount: null,
    languages: [],
    auth: { token: '', email: '', loggedIn: false },
    subaccounts: {},
    // @ts-ignore
    registrationAccountType: null,
    uploadingState: {},
    langCode: 'en',
    // @ts-ignore
    ownerImage: null,
    audioCallState: audioCallInitialState,
    sideBarOpened: true,
};

export interface AuthStatus {
    token: string;
    email: string;
    loggedIn: boolean;
}

export interface AudioCallState {
    selectedUser: number;
    accounts: any;
    callId: string;

    outboundWindowCall: any;
    callsSummary: CallDataDto;
}
