import { Pipe, PipeTransform } from '@angular/core';
import { AccountsService } from 'core-lib';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Pipe({
  name: 'avatarFetcher',
})
export class AvatarFetcherPipe implements PipeTransform {

  result: string = '';

  constructor(
    private accountService: AccountsService) {
  }

  transform(accountId: number): Observable<string | null> {

    return this.accountService.getPhotoForAccount(accountId).pipe(map(c => c.image));
  }

}
