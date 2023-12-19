import { Pipe, PipeTransform } from '@angular/core';
import { Contact, ContactItemInformationCategory } from 'core-lib';

@Pipe({
    name: 'contactEmail',
})
export class ContactEmailPipe implements PipeTransform {

    transform(contact: Contact, option: ContactItemInformationCategory = ContactItemInformationCategory.EMAIL): string {
        const options = contact.optionList.filter(c => c.category === option);
        if (options?.length > 0) {
            return options[0].value || '';
        }
        return '';
    }

}
