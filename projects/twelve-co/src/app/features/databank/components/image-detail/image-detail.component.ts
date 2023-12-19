import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SubSink } from 'subsink';
import { DatabankService } from '../../services';

@Component({
  selector: 'app-image-detail',
  templateUrl: './image-detail.component.html',
  styleUrls: [ './image-detail.component.scss' ],
})
export class ImageDetailComponent implements OnInit, OnDestroy {
  @Input() imageId!: string;
  image$: Observable<string>;
  private subSink = new SubSink();

  constructor(private databankService: DatabankService) {
  }

  ngOnInit(): void {
    this.image$ = this.databankService.findFolderPreview(this.imageId);
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

}
