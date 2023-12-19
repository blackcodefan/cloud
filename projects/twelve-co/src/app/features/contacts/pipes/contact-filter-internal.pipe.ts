import { Pipe, PipeTransform } from '@angular/core';
import { Contact } from 'core-lib';

@Pipe({
    name: 'contactFilterInternal',
})
export class ContactFilterInternalPipe implements PipeTransform {

    transform(contacts: Array<Contact>, internal: boolean = true): Array<Contact> {
        return contacts.filter(c => (c.in12CO ?? false) === internal);
    }

}
