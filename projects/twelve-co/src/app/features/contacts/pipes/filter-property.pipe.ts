import { Pipe, PipeTransform } from '@angular/core';
import { Contact, ContactItemInformation, ContactItemInformationCategory } from 'core-lib';

@Pipe({
  name: 'filterProperty',
})
export class FilterPropertyPipe implements PipeTransform {

  transform(contact: Contact, filterKey: ContactItemInformationCategory): Array<ContactItemInformation> {
    return contact.optionList.filter(o => o.category === filterKey);
  }

}
