import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../../../../environments/environment';
import { DatabankService } from '../../services';

@Component({
  selector: 'app-media-preview',
  templateUrl: './media-preview.component.html',
  styleUrls: [ './media-preview.component.scss' ],
})
export class MediaPreviewComponent implements OnInit {
  mediaData: any;
  readonly mediaId: string;
  mediaUrl: string;
  isAudio: boolean;
  extension: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private http: HttpClient, private databankService: DatabankService, private matSnack: MatSnackBar, private sanitizer: DomSanitizer) {
    this.mediaId = data.storageId;
    this.mediaUrl = `${ environment.apiUrl }storages/download${ this.mediaId }`;
    this.extension = this.data.extension;
    this.isAudio = this.data.extension === 'mp3' || this.data.extension === 'mp4a' || this.data.extension === 'flac' || this.data.extension === 'ogg' || this.data.extension === 'oga'
      || this.data.extension === 'wav';
  }

  ngOnInit(): void {
    this.databankService.downloadStorage(this.mediaId).subscribe((movieBlob: Blob) => {
      // URL.createObjectURL(movieBlob);
      this.mediaData = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(movieBlob));
      console.log("this media data" + this.mediaData);
    });
  }

}
