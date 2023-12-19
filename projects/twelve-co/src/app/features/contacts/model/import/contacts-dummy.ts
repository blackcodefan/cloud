import { ContactsParser } from './contacts-parser';
import { Contact } from 'core-lib'

export class ContactsDummy implements ContactsParser {

  constructor() {
  }

  getContacts(): Contact[] {
    return [];
  }
}
