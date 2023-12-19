import { Pipe, PipeTransform } from '@angular/core';
import { AccountsService } from 'core-lib';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { DatabankService } from '../services';

@Pipe({
  name: 'itemIconFetcher',
})
export class ItemIconFetcherPipe implements PipeTransform {

  result: string = '';

  constructor(
    private dataBankService: DatabankService) {
  }

  transform(iconId: string): Observable<string | null> {

    return this.dataBankService.findItemIcon(iconId).pipe(shareReplay());

  }

}
