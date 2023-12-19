import { Pipe, PipeTransform } from '@angular/core';
import { Contact, ContactItemInformation, ContactItemInformationCategory } from "core-lib";

@Pipe({
  name: 'filterPipe',
})
export class FilterPipe implements PipeTransform {
  transform(contacts: Contact[], input: any): any {
    if (input != null && input.length >= 2) {
      let searchString = input.toLowerCase();
      return contacts.filter((val: Contact) => this.matchesString(val?.firstName, searchString)
        || this.matchesString(val?.lastName, searchString)
        || this.matchesEmail(val?.optionList, searchString)
        || this.matchesPhone(val?.optionList, searchString)
      );
    } else {
      return contacts;
    }
  }


  searchForPhone(value: any, input: any): boolean {
    return typeof value.phone === 'string'
      ? this.cleanString(value.phone).indexOf(this.cleanString(input)) >= 0
      : value.phone.filter(
      (phone: any) => this.cleanString(phone.value).indexOf(this.cleanString(input)) >= 0,
    ).length > 0;
  }

  cleanString(value: string): string {
    return value //? value.split(' ').join('') : '';
  }

  private matchesString(objProp: string | null | undefined, searchString: string): boolean {
    if (objProp) {
      return objProp.toLowerCase()?.indexOf(searchString) >= 0;
    }
    return false;
  }

  /**
   * Search for emails matching a regex
   * @param objProp array of emails
   * @param searchString string regex
   * @private
   */
  private matchesEmail(objProp: Array<ContactItemInformation>, searchString: string): boolean {
    const emails = objProp.filter(prop => prop.category === ContactItemInformationCategory.EMAIL).map(prop => prop.value?.toLowerCase() || '');
    if (emails && emails.length > 0) {
      return emails.filter(e => e.indexOf(searchString) >= 0).length > 0;
    }
    return false;
  }

  /**
   * Search for emails matching a regex
   * @param objProp array of emails
   * @param searchString string regex
   * @private
   */
  private matchesPhone(objProp: Array<ContactItemInformation>, searchString: string): boolean {
    const phones = objProp.filter(prop => prop.category === ContactItemInformationCategory.PHONE).map(prop => prop.value?.toLowerCase() || '');
    if (phones && phones.length > 0) {
      return phones.filter(e => e.indexOf(searchString) >= 0).length > 0;
    }
    return false;
  }
}
