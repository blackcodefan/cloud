import { createAction, props } from '@ngrx/store';
import { AccountSummary, AccountTypeEnum, CallDataDto, DashboardItem, ItemDetails, Language, NotificationContent, UploadDetail, User } from 'core-lib';

export const logInAction = createAction('[Auth] Set log in action', props<{ username: string, authToken: string, loggedIn: boolean }>());
export const setTokenAction = createAction('[AUTH] Update auth token', props<{ authToken: string }>());
export const setLoggedInState = createAction('[AUTH] Set logged in state', props<{ loggedIn: boolean }>());
export const setLanguages = createAction('[APP] set languages', props<{ languages: Array<Language> }>());
export const setLangCodeAction = createAction('[APP] set app language code', props<{ langCode: string }>());
export const logoutAction = createAction('[APP] logout');
export const loadSubaccounts = createAction('[App] Load subaccounts action', props<{ subaccounts: { [key: number]: AccountSummary } }>());
export const loadSubscriberAction = createAction('[APP] Load subscriber action', props<{ subscriber: User }>());
export const setSelectedAccount = createAction('[APP] Set selected account ', props<{ selectedAccount: AccountSummary }>());
export const setAccountTypeAction = createAction('[APP] Set account type  registration', props<{ accountType: AccountTypeEnum }>());
export const setCallsSummary = createAction('[ALO] Set calls summary ', props<{ callsSummary: CallDataDto }>());
export const setUploadingItemAction = createAction('[APP] Uploading item acion', props<{ item: UploadDetail }>());
// export const removeUploadingNotification = createAction('[Box Info]Remove UploadingNotification To SingleBox', props<{ boxId: string, notificationID: string }>());
export const removeUploadFromQueue = createAction('[Box upload]Remove notification from queue ', props<{ notificationId: string }>());
export const clearUploadQueue = createAction('[Box upload] Clear upload quuue ');
export const setDashboardPreview = createAction('[App INFO] set dashboard preview ', props<{ dashboardPreview: boolean }>());
export const setInCall = createAction('[ALO] Set in call ', props<{ inCall: boolean }>());
export const setCallId = createAction('[ALO] Set call id ', props<{ callId: string }>());
export const setOwnerImage = createAction('[APP] Setting owner image', props<{ ownerImage: string }>());
export const setCurrentApp = createAction('[APP] set current application', props<{ currentAppKey: string }>());
export const setAppList = createAction('[APP] set app list', props<{ appList: Array<DashboardItem> }>());
export const setInvitation = createAction('[APP] new invitation received', props<{ invitation: NotificationContent }>());
export const setInvitations = createAction('[APP] new invitations received', props<{ invitations: Array<NotificationContent> }>());
export const setSelectedBox = createAction('[DATABANK] set selected box', props<{ selectedBox: ItemDetails }>());
export const setCurrentFolder = createAction('[DATABANK] set current selected folder', props<{ selectedFolder: ItemDetails }>());
export type AppActions =
    ReturnType<typeof setTokenAction>
    | ReturnType<typeof setLoggedInState>
    | ReturnType<typeof setLangCodeAction>
    | ReturnType<typeof logoutAction>
    | ReturnType<typeof loadSubaccounts>
    | ReturnType<typeof loadSubscriberAction>
    | ReturnType<typeof setAccountTypeAction>
    | ReturnType<typeof setCurrentApp>
    | ReturnType<typeof setUploadingItemAction>
    // | ReturnType<typeof removeUploadingNotification>
    | ReturnType<typeof logInAction>;

