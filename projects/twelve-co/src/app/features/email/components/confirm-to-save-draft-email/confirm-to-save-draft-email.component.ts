import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-confirm-to-save-draft-email',
  templateUrl: './confirm-to-save-draft-email.component.html',
  styleUrls: ['./confirm-to-save-draft-email.component.scss']
})
export class ConfirmToSaveDraftEmailComponent implements OnInit {

  constructor(
      private matDialogRef: MatDialogRef<ConfirmToSaveDraftEmailComponent>
  ) { }

  ngOnInit(): void {
  }

  closeActionModal(flag: boolean) {
      this.matDialogRef.close({save: flag});
  }
}
