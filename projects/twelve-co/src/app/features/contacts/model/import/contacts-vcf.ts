import { ContactsParser } from './contacts-parser';
import { VCardWrap } from './vcard-wrap';
import { Contact } from "core-lib";

declare function require(path: string): any;

export class ContactsVcf implements ContactsParser {

  constructor(private content: string) {
  }

  getContacts(): Contact[] {
    const vCard = require('vcf');
    const cards = vCard.parse(this.content) as Array<any>;
    return cards
      .map(card => new VCardWrap(card).buildContact())
      .filter(contact => null !== contact);
  }
}
