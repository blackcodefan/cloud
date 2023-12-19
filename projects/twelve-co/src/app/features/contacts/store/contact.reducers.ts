import { Action, createReducer, on } from '@ngrx/store';
import {
  changeNewGroupStatus,
  changeSortByKey,
  loadContactsAction,
  setContactViewMode,
  setCurrentUserAction,
  setDefaultGroupCount,
  setGroups,
  setNewContactFlag,
  setSelectedContact,
  setSelectedGroupAction,
  setSortDirection,
} from './contact.actions';
import { contactsInitialState, ContactsState } from './contact.store';

const contactsReducers = createReducer(
  contactsInitialState,
  on(setSelectedContact, (state, { selectedContact }) => ({ ...state, selectedContact: selectedContact })),
  on(changeSortByKey, (state, { sortKey }) => ({ ...state, sortNameKey: sortKey })),
  on(setContactViewMode, (state, { viewMode }) => ({ ...state, viewMode: viewMode })),
  on(setCurrentUserAction, (state, { selectedUser }) => ({ ...state, selectedUser: selectedUser })),
  on(loadContactsAction, (state, { contacts }) => ({ ...state, availableContacts: contacts })),
  on(setGroups, (state, { groups }) => ({ ...state, groups: groups })),
  on(changeNewGroupStatus, (state, { newGroupStatus }) => ({ ...state, isNewGroup: newGroupStatus })),
  on(setSelectedGroupAction, (state, { groupId }) => ({ ...state, selectedGroupId: groupId })),
  on(setDefaultGroupCount, (state, { defaultGroupCount }) => ({ ...state, defaultGroupCount: defaultGroupCount })),
  on(setSortDirection, (state, { sortDirection }) => ({ ...state, sortDirection: sortDirection })),
  on(setNewContactFlag, (state, { newContactFlag }) => ({ ...state, newContactFlag: newContactFlag })),
);

export function contactsAppReducer(state: ContactsState, action: Action) {
  return contactsReducers(state, action);
}
