import { createAction, props } from '@ngrx/store';
import { Contact, Group } from 'core-lib';
import { ContactDefaultGroupEnum, ContactGroup, ViewMode } from '../model';

export const loadContactsAction = createAction('[CONTACTS] load contacts for category', props<{ contacts: Contact[] }>());
export const setSelectedGroupAction = createAction('[CONTACTS] set selected group action', props<{ groupId: number }>());
export const setEditingContactsState = createAction('[CONTACTS] Set editing state ', props<{ editingContact: boolean }>());
export const setNewContactFlag = createAction('[CONTACTS] Set new contact flag ', props<{ newContactFlag: boolean }>());
export const setContactViewMode = createAction('[CONTACTS] Set view mode', props<{ viewMode: ViewMode }>());

export const clearStoreAction = createAction('[CONTACTS] reset store');
export const setCurrentUserAction = createAction('[CONTACTS]', props<{ selectedUser: number }>());


// new stuff


export const changeSortByKey = createAction('[Contacts App Info] Update the sort by key value of contacts info', props<{ sortKey: string }>());
export const changeNewGroupStatus = createAction('[Contacts App Info] Update new group status of contacts info', props<{ newGroupStatus: boolean }>());
export const changeSideBarStatus = createAction('[APP] change sidebar status', props<{ status: boolean }>());
export const setSelectedContact = createAction('[CONTACT] set selected ', props<{ selectedContact: Contact }>());
export const setSortDirection = createAction('[CONTACT] set sort Direction ', props<{ sortDirection: string }>());
export const setGroups = createAction('[CONTACT] set setGroups ', props<{ groups: Array<Group> }>());
export const deleteSelectedContact = createAction('[CONTACT] delete contact ', props<{ selectedContact: any }>());
export const blockSelectedContact = createAction('[CONTACT] block a contact ', props<{ selectedContact: any }>());
export const addNewGroup = createAction('[CONTACT] block a contact ', props<{ newGroup: ContactGroup }>());
export const setDefaultGroupCount = createAction('[CONTACT] add default group count ', props<{ defaultGroupCount: { [ContactDefaultGroupEnum.MY_CONTACTS]: number, [ContactDefaultGroupEnum.BLOCKED]: number } }>());
