import {Component, Input, OnInit} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-delete-box-popup',
  templateUrl: './delete-box-popup.component.html',
})
export class
DeleteBoxPopupComponent implements OnInit {

  @Input() boxType!: string;
  @Input() boxName!: string;
  constructor(
    public matDialog: MatDialogRef<DeleteBoxPopupComponent>
  ) { }

  ngOnInit(): void {
  }

}
