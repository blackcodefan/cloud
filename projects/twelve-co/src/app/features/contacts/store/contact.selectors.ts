import { createFeatureSelector, createSelector } from '@ngrx/store';

import { Contact, Group } from 'core-lib';
import { State } from '../../../store';
import { contactsStorekey } from '../static-data';
import { ContactsState } from './contact.store';

export const contactState = createFeatureSelector<ContactsState>(contactsStorekey);
export const selectContacts = createSelector(contactState, (state: ContactsState): Contact[] => state.availableContacts);
export const selectSelectedGroupId = createSelector(contactState, (state: ContactsState): number => state.selectedGroupId);

// new stuff


export const appState = createFeatureSelector<State>('appStateKey');
export const selectSelectedContact = createSelector(contactState, (state: ContactsState): any => state.selectedContact);
export const selectSortDirection = createSelector(contactState, (state: ContactsState): any => state.sortDirection);
export const getBlockedContacts = createSelector(contactState, (state: ContactsState): any => state.blockedContactList);
export const selectNewGroupStatus = createSelector(contactState, (state: ContactsState): boolean => state.isNewGroup);
export const selectGroupList = createSelector(contactState, (state: ContactsState): Array<Group> => state.groups);
export const selectSelectedGroup = createSelector(contactState, (state: ContactsState): Group => state.groups.filter(c => c.id == state.selectedGroupId)[0] ?? null);
export const selectSortKey = createSelector(contactState, (state: ContactsState): string => state.sortNameKey);
export const selectDefaultGroupCount = createSelector(contactState, (state: ContactsState): any => state.defaultGroupCount);


export const selectSidebarStatus = createSelector(appState, (state) => state.sideBarOpened);
export const selectSelectedSubscriber = createSelector(appState, (state) => state.subscriber);
export const selectSelectedAccount = createSelector(appState, (state) => state.selectedAccount);
