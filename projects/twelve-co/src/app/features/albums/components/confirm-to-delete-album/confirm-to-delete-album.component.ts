import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-confirm-to-delete-album',
  templateUrl: './confirm-to-delete-album.component.html',
  styleUrls: ['./confirm-to-delete-album.component.scss']
})
export class ConfirmToDeleteAlbumComponent implements OnInit {

  constructor(
      private matDialogRef: MatDialogRef<ConfirmToDeleteAlbumComponent>
  ) { }

  ngOnInit(): void {
  }

  closeActionModal() {
      this.matDialogRef.close({action: true});
  }
}
