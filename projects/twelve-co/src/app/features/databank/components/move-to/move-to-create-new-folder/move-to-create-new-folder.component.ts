import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FileElement } from '../../../models';

@Component({
  templateUrl: './move-to-create-new-folder.component.html',
  styleUrls: ['./move-to-create-new-folder.component.scss'],
})
export class MoveToCreateNewFolderComponent implements OnInit {
  @Input() newFolderName!: string;
  @Input() currentElementList!: Array<FileElement>;
  @ViewChild('matInput') matInput!: ElementRef<HTMLInputElement>;

  constructor(
    private matDialogRef: MatDialogRef<MoveToCreateNewFolderComponent>,
    private snackbar: MatSnackBar,
  ) {
  }

  ngOnInit(): void {
    setTimeout((x: any) => {
      this.matInput.nativeElement.focus();
      this.matInput.nativeElement.select();
    }, 300);
  }

  closeModal() {
    this.matDialogRef.close();
  }

  remove_newFolderName() {
    this.newFolderName = '';
  }

  setNewFolderName(event: any) {
    this.newFolderName = event.target.value;
    if (event.keyCode === 13) {
      this.saveNewFolder();
    }
  }

  saveNewFolder() {
    this.newFolderName = this.newFolderName?.trim();
    if (this.newFolderName.length > 0 && this.newFolderName !== undefined && this.newFolderName !== null) {
      if (this.ConfirmBoxNameDuplicated(this.newFolderName)) {
        this.snackbar.open('The Folder name "' + this.newFolderName + '" is already taken. Please choose a different name', 'close');
      } else {
        this.matDialogRef.close({ folderName: this.newFolderName });
      }
    } else {
      this.snackbar.open('The folder name can not be empty', 'close');
    }
  }

  // Findout the  name is duplicated or not
  ConfirmBoxNameDuplicated(BoxName: string): boolean {
    const DuplicatedBoxItemIndex = this.currentElementList!.findIndex((x: any) => x.name == this.newFolderName);
    return DuplicatedBoxItemIndex != -1;
  }

  preventEnter(event: any) {
    if (event.keyCode == 13) {
      return false;
    }
    return true;
  }

}
