import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { AccountSummary, LoaderService, User, UserServiceService } from 'core-lib';
import { SubSink } from 'subsink';
import { LoginService } from '../../services';
import { selectSelectedSubscriber, State } from '../../store';

@Component({
  selector: 'app-user-switch-account-dialog',
  templateUrl: './user-switch-account-dialog.component.html',
  styleUrls: [ './user-switch-account-dialog.component.scss' ],
})
export class UserSwitchAccountDialogComponent implements OnInit {
  users: Array<User>;
  accounts: Array<AccountSummary>;
  private subSink = new SubSink();

  constructor(private store: Store<State>, private ref: MatDialogRef<UserSwitchAccountDialogComponent>, private accountService: UserServiceService, private loginService: LoginService,
              private router: Router, private loader: LoaderService) {
  }

  ngOnInit(): void {
    this.subSink.sink = this.store.pipe(select(selectSelectedSubscriber)).subscribe(c => this.users = [ c ]);
    this.subSink.sink = this.accountService.fetchSubAccounts().subscribe(acc => this.accounts = acc);
  }

  handleSignOut() {
    this.subSink.sink = this.loginService.logout().subscribe(res => {
      this.ref.close();
      this.loader.hideLoader();
      this.router.navigate([ '/' ]);
    }, error => {
      console.log('error signing out');
      this.loader.hideLoader();
      this.ref.close();
    });
  }
}
