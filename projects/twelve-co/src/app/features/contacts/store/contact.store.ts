import { Contact, Group } from 'core-lib';
import { ContactDefaultGroupEnum } from '../model/enums';

export interface ContactsState {
  selectedUser: number;
  accounts: any;
  selectedContact: Contact;
  availableContacts: Contact[];
  editingContact: boolean;
  newContactFlag: boolean;
  selectedGroupId: number;
//  new stuff
  moduleName: string,
  blockedContactList: Array<any>,
  contactList: Array<any>,
  isNewGroup: boolean;
  groups: Array<Group>
  sortNameKey: string;
  sortDirection: string;
  defaultGroupCount: { [ContactDefaultGroupEnum.MY_CONTACTS]: number, [ContactDefaultGroupEnum.BLOCKED]: number };
}


export const contactsInitialState: ContactsState = {
  // @ts-ignore
  selectedUser: null,
  accounts: [],
  sortNameKey: 'firstName',
  sortDirection: 'ascending',
  isNewGroup: false,
  groups: [],
  // @ts-ignore
  selectedContactCategory: null,
  // @ts-ignore
  selectedContact: null,
  editingContact: false,
  newContactFlag: false,
  availableContacts: [],
  selectedGroupId: -1,
  defaultGroupCount: { [ContactDefaultGroupEnum.MY_CONTACTS]: 0, [ContactDefaultGroupEnum.BLOCKED]: 0 },
};
