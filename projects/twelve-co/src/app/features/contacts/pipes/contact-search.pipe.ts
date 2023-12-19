import { Pipe, PipeTransform } from '@angular/core';
import { Contact } from 'core-lib';

@Pipe({
    name: 'contactSearch',
})
export class ContactSearchPipe implements PipeTransform {

    transform(contacts: Array<Contact>, searchTerm: string): any[] {
        return contacts;
    }

}
