import { Component, OnInit } from '@angular/core';
import {UntypedFormControl, UntypedFormGroup, Validators} from "@angular/forms";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-new-album',
  templateUrl: './new-album.component.html',
  styleUrls: ['./new-album.component.scss']
})
export class NewAlbumComponent implements OnInit {
  isSubmit!: boolean;
  newAlbumForm!: UntypedFormGroup
  constructor(
      private dialogRef: MatDialogRef<NewAlbumComponent>
  ) {
    this.newAlbumForm = new UntypedFormGroup({
      album: new UntypedFormControl('', [Validators.required])
    });
  }

  ngOnInit(): void {

  }

  saveNewAlbum() {
    this.isSubmit = true;
    if(this.newAlbumForm.valid){
      this.dialogRef.close({data: this.newAlbumForm.value.album});
    }
  }

}
