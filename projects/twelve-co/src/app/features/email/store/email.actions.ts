import { getSelectedLabel } from './email.selectors';
import { createAction, props } from '@ngrx/store';
import {  EmailCounts, EmailDraftItem, EmailRead, EmailShowStatus, EmailViewItem, Label, MediaItem } from '../model';

export const setAppTitle = createAction('[App Info] Set App Title', props<{ appTitle: string }>());
export const addNewMedia = createAction('[Album List] Add New Media', props<{ mediaItem: MediaItem }>());
export const addNewDraftEmail = createAction('[Email List] Add New Draft Email', props<{ emailItem: EmailDraftItem }>());
export const addFixedLabels = createAction('[Email List] Add Fixed Labels', props<{ labels: Array<Label> }>());
export const addNewLabel = createAction('[Email List] Add New Label', props<{ label: Label }>());
export const updateLabel = createAction('[Email List] Update Label', props<{ label: Label }>());
export const removeLabel = createAction('[Email List] Remove Label', props<{ id: string }>());
export const setLabelList = createAction('[Email List] Set Label List', props<{ labelList: Array<Label> }>());
export const setSelectedLabel = createAction('[Email List] Set Selected Label', props<{ selectedLabel: Label }>());
export const setEmailCounts = createAction('[Email List] Set email counts', props<{ emailCounts: EmailCounts }>());
export const setAsReadEmail = createAction('[Email Item] Set As Read Email', props<{emailRead: EmailRead }>());
export const setStarRedEmail = createAction('[Email Item] Set Star Read of list Email', props<{ emailID: string }>());
export const setFlagEmail = createAction('[Email Item] Set Flag of List Email', props<{ emailID: string, color: string }>());
export const setInviteStatusEmail = createAction('[Email List] Set Invite Status of Email List', props<{ emailID: string, inviteStatus: string }>());
export const removeEmail = createAction('[Email List] Remove Item of Email List', props<{ emailId: string }>());
export const setEmailsList = createAction('[Email List] Set Emails List', props<{ emailsList: Array<EmailViewItem> }>());
export const setEmail = createAction('[Email List] Set Email List', props<{ emailsList: Array<EmailViewItem> }>());
export const updateDraftEmail = createAction('[Email List] Update Draft Email', props<{ emailItem: EmailDraftItem }>());
export const reverseShowEmailDetailStatus = createAction('[Email List] set Email Detail Status', props<{ emailID: string }>());
export const updateDraftEmailStatus = createAction('[Email List] Update Draft Email Status', props<{ emailID: string, status: EmailShowStatus.ZoomIn }>());
export const changeEmailDisplayStatus = createAction('[Email List] Change Email Display Status', props<{ emailID: string, status: EmailShowStatus }>());

export type  EmailActions = ReturnType<typeof addNewMedia> |
    ReturnType<typeof addNewDraftEmail>;
