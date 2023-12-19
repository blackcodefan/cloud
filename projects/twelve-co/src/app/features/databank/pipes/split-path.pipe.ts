import { Pipe, PipeTransform } from '@angular/core';
import { ItemDetails } from 'core-lib';

@Pipe({
  name: 'splitPath',
})
export class SplitPathPipe implements PipeTransform {

  transform(value: ItemDetails): Array<string> {
    return value?.path!.split('/') ?? [];
  }

}
