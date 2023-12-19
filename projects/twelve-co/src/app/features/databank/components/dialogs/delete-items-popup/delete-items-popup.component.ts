import {Component, Input, OnInit} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-delete-items-popup',
  templateUrl: './delete-items-popup.component.html',
})
export class DeleteItemsPopupComponent implements OnInit {
  @Input() itemsType!: string;
  @Input() itemsDetail!: string;
  constructor(
    public matDialog: MatDialogRef<DeleteItemsPopupComponent>
  ) { }

  ngOnInit(): void {
  }

}
