import { Pipe, PipeTransform } from '@angular/core';
import { Contact } from 'core-lib';

@Pipe({
  name: 'sortContactBy',
})
export class SortContactByPipe implements PipeTransform {


  transform(value: Array<Contact>, name: string, sortDirection?: string): Array<Contact> {
    let sortDir = sortDirection ? sortDirection : 'ascending';
    value.sort((a, b) => this.compare(a, b, name));
    if (sortDir !== 'ascending') {
      console.log('changed sort direction');
      value.reverse();
    }
    return value;
  }

  compare(a: Contact, b: Contact, sortKey: string): 1 | -1 | 0 {
    if (a[sortKey]?.toLowerCase() < b[sortKey]?.toLowerCase()) {
      return -1;
    }
    if (a[sortKey]?.toLowerCase() > b[sortKey]?.toLowerCase()) {
      return 1;
    }
    return 0;
  }


}
