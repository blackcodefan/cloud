import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map } from 'rxjs/operators';
import { DatabankService } from '../../services';

@Component({
  selector: 'app-pdf-preview-component',
  templateUrl: './pdf-preview-component.component.html',
  styleUrls: [ './pdf-preview-component.component.scss' ],
})
export class PdfPreviewComponentComponent implements OnInit {
  @ViewChild('pdfViewerAutoLoad') pdfViewerAutoLoad;
  private pdfId: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private databankService: DatabankService, private matSnack: MatSnackBar) {
    console.log('data in the viewer', data);
    this.pdfId = data.storageId;
    console.log('data in the viewer', this.pdfId);
  }

  ngOnInit(): void {
    this.databankService.downloadStorage(this.pdfId)
      .pipe(map((result: any) => result)).subscribe(pdf => {

      this.pdfViewerAutoLoad.pdfSrc = pdf; // pdfSrc can be Blob or Uint8Array
      this.pdfViewerAutoLoad.refresh();
    });
  }

}
