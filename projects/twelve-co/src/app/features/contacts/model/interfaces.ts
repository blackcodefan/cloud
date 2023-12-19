import { Contact, User } from 'core-lib';

export interface CsvRecord {
  getContact(): Contact;
}

export interface Item {
  title: string;
  test?: string;
  contacts: User[];
  type?: ItemTypes;
}

export enum ItemTypes {
  general = 'general',
  public = 'public',
  private = 'private',
  blocked = 'blocked',
  group = 'group',
  duplicates = 'duplicates',
}

export interface Menu {
  header: string;
  items: Array<Item>;
}

export const defaultItem: Item = {
  title: '',
  contacts: [],
  test: '',
  type: ItemTypes.general,
};


export enum ContactTypes {
  home = 'home',
  work = 'work',
  other = 'other',
}


// old stuff
export class ContactGroup {
  id: string;
  name: string;
  contacts: Array<ContactItem>;
}

export class ContactItem {
  firstName: string;
  middleName: string;
  lastName: string;
  company: string;
  department: string;
  job_title: string;
  emails: Array<string>;
  phones: Array<number>;
  addresses: Array<ContactAddress>;
  birthDate: string;
  note: string;
}

export class ContactAddress {
  address: string;
  street: string;
  street_line2: string;
  city: string;
  postalCode: string;
  region: string;
  country: string;
}


export class Contact12CoItem {
  id: string;
  firstName: string;
  lastName: string;
  account: string;
  country: string;
  avatarImage: string;
  status: boolean;
}
