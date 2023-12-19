import { Router } from '@angular/router';
import { SubSink } from 'subsink';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import { EmailService } from '../../services/email.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-confirm-to-delete-email',
  templateUrl: './confirm-to-delete-email.component.html',
  styleUrls: ['./confirm-to-delete-email.component.scss']
})
export class ConfirmToDeleteEmailComponent implements OnInit {

    title: string;
    action: 'delete' | 'trash';
    selectedEmailId: string;
    chainId: string;
    labelParam: string;
    gotoEmailList: boolean;

    private subSink = new SubSink();

  constructor(
      private matDialogRef: MatDialogRef<ConfirmToDeleteEmailComponent>,
      private matSnack: MatSnackBar,
      private emailService: EmailService,
      private spinner: NgxSpinnerService,
      private router:Router
  ) { }

  ngOnInit(): void {
  }

  closeActionModal() {
    // default navigate to email chain list
    let url = this.router.navigate(['/apps/emails/chain-email-list/' + this.chainId ]);
    if(this.gotoEmailList) { // else to emails list
        this.router.navigate([ '/apps/emails/emails-list/' + this.labelParam ]);
    }
    // this.spinnerContent = 'Removing a new message';
    this.spinner.show();
    if (this.action === 'delete') {
        this.subSink.sink = this.emailService.deleteEmail(this.selectedEmailId).subscribe(result => {
            this.matSnack.open('EMAIL.delete_success', 'info');
            this.spinner.hide();
            this.matDialogRef.close();
            this.router.navigate([ url ]);
        }, error => {
            console.error('Error while delete email', error);
            this.matSnack.open('EMAIL.delete_email_error',  error?.error?.message);
            this.spinner.hide();
        });
    } else if (this.action === 'trash') {
        this.subSink.sink = this.emailService.trashEmail(this.selectedEmailId).subscribe(result => {
            this.matSnack.open('EMAIL.trash_success', 'info');
            this.spinner.hide();
            this.matDialogRef.close();
            this.router.navigate([ url ]);
        }, error => {
            console.error('Error while move email in trash.', error);
            this.matSnack.open('EMAIL.trash_email_error',  error?.error?.message);
            this.spinner.hide();
        });
    }

  }
}
