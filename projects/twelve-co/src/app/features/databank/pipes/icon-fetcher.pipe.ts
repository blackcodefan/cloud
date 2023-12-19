import { Pipe, PipeTransform } from '@angular/core';
import { AccountsService } from 'core-lib';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { DatabankService } from '../services';

@Pipe({
  name: 'iconFetcher',
})
export class IconFetcherPipe implements PipeTransform {

  result: string = '';

  constructor(
    private dataBankService: DatabankService,
    private accountService: AccountsService) {
  }

  transform(iconId: string | null, accountId: number): Observable<string | null> {

    if (iconId) {
      return this.dataBankService.findFolderIcon(accountId, iconId).pipe(shareReplay());
    }
    //default return account picture
    return this.accountService.getPhotoForAccount(accountId).pipe(map(c => c.image));
  }

}
