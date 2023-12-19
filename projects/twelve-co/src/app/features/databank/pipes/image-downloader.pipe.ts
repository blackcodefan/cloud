import { Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { DatabankService } from '../services';

@Pipe({
  name: 'imageDownloader',
})
export class ImageDownloaderPipe implements PipeTransform {
  constructor(private downloadService: DatabankService) {
  }

  transform(value: string, decrypt: boolean = true): Observable<string> {
    if (!decrypt) {
      return of('');
    }
    return this.downloadService.downloadStorage(value)
      .pipe(tap(c => console.log(c)),
        shareReplay(),
        tap(c => console.log('fetching image')),
        map(c => URL.createObjectURL(c)),
      );
  }

}
