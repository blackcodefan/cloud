import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<NotificationComponent>) {
  }

  ngOnInit(): void {
  }

  closeModal() {
    this.dialogRef.close();
  }
}
