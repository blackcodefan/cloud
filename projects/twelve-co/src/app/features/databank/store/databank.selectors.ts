import { createAction, createFeatureSelector, createSelector, props } from '@ngrx/store';
import { AccountSummary, CallDataDto, FolderTreeContentDto, ItemDetails, NotificationContent, UploadWrapper } from 'core-lib';
import { AudioCallState, State } from '../../../store';
import { BreadCrumbElement, databankStateKey, FilterBoxKeyEnum, SortByEnum } from '../models';
import { DatabankState } from './databank.state';

export const appState = createFeatureSelector<State>('appStateKey');
export const databankState = createFeatureSelector<DatabankState>(databankStateKey);
export const setSelectedAccount = createAction('[APP] Set selected account ', props<{ selectedAccount: AccountSummary }>());
export const selectAudioCallState = createSelector(appState, (state: State): AudioCallState => state.audioCallState);
// ------------------------------------------------------------------------------------
export const getAppInfo = createSelector(databankState, (state: DatabankState) => state.appInfo);

// export const selectAllBoxs = createSelector(databankState, (state: DatabankState): Array<BoxElement> => state.boxs);
export const selectAllBoxes = createSelector(databankState, (state: DatabankState): Array<ItemDetails> => state.boxes);

// export const retriveSingleBox = (id: string) => createSelector(selectAllBoxs, (boxElements: Array<BoxElement>) => boxElements.find(x => x.id == id));
export const retriveSingleBox = (id: string) => createSelector(selectAllBoxes, (boxElements: Array<ItemDetails>) => boxElements.find(x => x.itemId == id));

export const selectSelectedAccount = createSelector(appState, (state: State): AccountSummary => {
    return state.selectedAccount;
});
export const selectWithDescription = createSelector(databankState, (state: DatabankState): Array<String> => state.boxes.map(x => x.description));
export const selectState = createSelector(databankState, (state: DatabankState): DatabankState => state);

export const selectBoxContent = createSelector(databankState, (state: DatabankState): Array<FolderTreeContentDto> => state.boxContent);
export const selectBoxFolderIds = createSelector(databankState, (state: DatabankState): Array<string> => state.boxContent.map(bc => bc.itemId));
export const selectSelectedFolder = createSelector(databankState, (state: DatabankState): ItemDetails => state.selectedFolder);

export const selectSelectedBox = createSelector(databankState, (state: DatabankState) => state.selectedBox);
export const getGridView = createSelector(databankState, (state: DatabankState) => state.gridView);
export const selectSortByType = createSelector(databankState, (state: DatabankState): SortByEnum => state.sortByType);
export const selectSortByDirection = createSelector(databankState, (state: DatabankState): 'ascending' | 'descending' => state.sortByDirection);
export const selectBoxesToDisplay = createSelector(databankState, (state: DatabankState): FilterBoxKeyEnum => state.boxesToDisplay);
export const selectSelectedBoxId = createSelector(databankState, (state: DatabankState): string => state.selectedBox?.itemId || '');
export const selectSelectedFile = createSelector(databankState, (state: DatabankState): ItemDetails => state.selectedFile);

export const selectBreadcrumbs = createSelector(databankState, (state: DatabankState): Array<BreadCrumbElement> => state.breadcrumb);
export const selectedStarredBoxsCount = createSelector(databankState, (state: DatabankState): number => state.boxes.filter(x => x.starred).length);
export const selectSelectedStorage = createSelector(databankState, (state: DatabankState): ItemDetails => state.selectedStorage);
export const selectSelectedStorageId = createSelector(databankState, (state: DatabankState): string => state.selectedStorage.itemId);


export const selectOwnerImage = createSelector(appState, (state: State): string => state.ownerImage);


export const selectNewBoxStatus = createSelector(databankState, (state: DatabankState): boolean => state.newBoxStatus);
export const selectNewFolderStatus = createSelector(databankState, (state: DatabankState): boolean => state.newFolderStatus);
export const selectBoxIsPreview = createSelector(databankState, (state: DatabankState): boolean => state.boxPreview);
export const selectCurrentPreviewType = createSelector(databankState, (state: DatabankState): string => state.currentPreviewType);


// invitations
export const selectInvitations = createSelector(appState, (state: State): Array<NotificationContent> => state.invitations);
export const selectInvitationsCount = createSelector(appState, (state: State): number => state.invitations.length || 0);


//upload state
export const selectUploadState = createSelector(appState, (state: State): UploadWrapper => state.uploadingState);


// calls state
export const selectSelectedUserId = createSelector(selectAudioCallState, (state: AudioCallState): number => state.selectedUser);
export const selectAccounts = createSelector(selectAudioCallState, (state: AudioCallState): Array<any> => state.accounts);
export const selectCallId = createSelector(selectAudioCallState, (state: AudioCallState): string => state.callId);
export const selectOtboundWindowCall = createSelector(selectAudioCallState, (state: AudioCallState): any => state.outboundWindowCall);
export const selectCallsSummary = createSelector(selectAudioCallState, (state: AudioCallState): CallDataDto => state.callsSummary);
export const selectInCall = createSelector(appState, (state: State): boolean => state.inCall);
export const selectAppMode = createSelector(appState, (state: State): string => state.currentApp);
