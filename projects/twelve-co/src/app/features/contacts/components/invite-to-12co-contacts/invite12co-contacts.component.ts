import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AccountSummary, AppTypeEnum, CheckBoxItem, InvitationService, LoaderService } from 'core-lib';
import { selectSelectedAccount } from 'projects/twelve-co/src/app/store';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-invite12co-contacts',
  templateUrl: './invite12co-contacts.component.html',
  styleUrls: [ './invite12co-contacts.component.scss' ],
})
export class Invite12coContactsComponent implements OnInit, OnDestroy {
  _language: string;
  @Input() emails: Array<CheckBoxItem>;
  @Input() count_email: number;
  email = '';
  account: AccountSummary;
  private subSink = new SubSink();

  constructor(
    public matDialogRef: MatDialogRef<Invite12coContactsComponent>,
    private store: Store<any>,
    private invitationService: InvitationService,
    private matSnack: MatSnackBar,
    private loader: LoaderService,
    private translate: TranslateService,
  ) {
    this._language = 'English';
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  ngOnInit(): void {
    this.subSink.sink = this.store.select(selectSelectedAccount).subscribe(acc => this.account = acc);
  }

  setLanguage(language: string) {
    this._language = language;
  }

  invite() {
    this.loader.showLoader();
    this.subSink.sink = this.invitationService.inviteEmails(this._language, this.account.id, this.emails, AppTypeEnum.CONTACTS).subscribe(result => {
      this.loader.hideLoader();
      if (this.emails.length === 1) {
        this.matSnack.open(this.translate.instant('invitations.INVITATION_SENT'));
      } else {
        this.matSnack.open(this.translate.instant('invitations.INVITATIONS_SENT'));
      }

      this.matDialogRef.close();

    });
  }
}
