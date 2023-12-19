import { ChangeDetectorRef, Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ItemDetails } from 'core-lib';
import { map, shareReplay, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { DatabankService } from '../services';

@Directive({
  selector: '[backgroundImage]',
})
export class BackgroundImageDirective implements OnInit, OnDestroy {

  @Input() backgroundImage: ItemDetails;
  private subSink = new SubSink();
  private imageExtensions = [ 'jpg', 'jpeg', 'png', 'gif', 'jpeg', 'tiff', 'eps' ];

  constructor(private downloadService: DatabankService, private sanitizer: DomSanitizer, private cdk: ChangeDetectorRef) {

  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  ngOnInit(): void {
    const htmlElement: HTMLElement = document.getElementById(`${ this.backgroundImage.itemId }item`) as HTMLElement;
    if (this.isImage(this.backgroundImage) && htmlElement) {
      this.subSink.sink = this.downloadService.downloadStorage(this.backgroundImage.itemId)
        .pipe(
          shareReplay(),
          tap(c => console.log(c)),
          tap(c => console.log('fetching image')),
          map((blob: Blob) => URL.createObjectURL(new Blob([ blob ], { type: this.backgroundImage.mimeType }))),
          tap(c => console.log(c)),
        ).subscribe((res: string) => {
          console.log('called');
          htmlElement.style.background = `url(${ res })`;
          // htmlElement.style.backgroundImage = `url(${res})`;
          this.cdk.markForCheck();
          this.cdk.detectChanges();
        });
    }
    if(htmlElement == null || htmlElement == undefined){
      console.log('undefined element')
    }
  }

  private isImage(value: ItemDetails) {
    const extension = value?.extension?.toLowerCase()?.replace('.', '') || '';
    return this.imageExtensions.indexOf(extension) !== -1;
  }
}
