import { Pipe, PipeTransform } from '@angular/core';
import { Group } from 'core-lib';

@Pipe({
  name: 'sortGroupsBy',
})
export class SortGroupsByPipe implements PipeTransform {


  transform(arr: Array<Group>, name: string, sortDir: string = 'ascending'): Array<Group> {
    let contacts = [ ...arr ];
    if (contacts === null || contacts === undefined) {
      return [];
    }
    contacts.sort((a, b) => this.compare(a, b));
    if (sortDir !== 'ascending') {
      contacts.reverse();
    }

    return contacts;
  }

  compare(a: Group, b: Group) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }

}
