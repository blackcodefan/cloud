import { Injectable } from '@angular/core';
import { Contact, UserNotificationService } from 'core-lib';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ContactsFile, ContactVisibility } from '../model';

@Injectable({
    providedIn: 'root',
})
export class ContactImportService {

    constructor(private userNotification: UserNotificationService) {
    }

    loadContactsFromFile(file: File): Observable<Contact[]> {
        return new ContactsFile(file, this.userNotification).getContacts().pipe(
            // Prepare the contacts for the server:
            // - add visible
            // - format the birthDate to ISO 8601
            map((contacts) => {
                contacts.forEach((contact) => contact.visible = ContactVisibility.VISIBLE);
                return contacts;
            }),
        );
    }
}
