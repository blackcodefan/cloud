import { Contact } from "core-lib";

export interface ContactsParser {
    getContacts(): Array<Contact>;
}
