import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { LoggingService } from 'core-lib';
import { Observable } from 'rxjs';
import { SubSink } from 'subsink';
import { logoutAction, selectAuthState, selectLoggedInState, State } from '../store';

@Injectable({
    providedIn: 'root',
})
export class AuthGuardService implements CanActivate {

    private loggedIn = false;
    private iat: number;
    private delta = 3600000;
    private subSink = new SubSink();
    private coch: number;

    constructor(private store: Store<State>, private logger: LoggingService, private translateService: TranslateService, private router: Router, private matSnack: MatSnackBar) {
        this.subSink.sink = this.store.pipe(select(selectLoggedInState)).subscribe(status => this.loggedIn = status);
        this.subSink.sink = this.store.pipe(select(selectAuthState)).subscribe((authFlag) => {
            try {
                const jwtData = atob(authFlag.token.split('.')[1]);
                const normalized = JSON.parse(jwtData);
                let expiry = normalized?.['lkt-iat'];
                this.coch = normalized?.['exp'];
                if (expiry) {
                    this.iat = parseInt(expiry, 10);
                }
            } catch (e) {
                this.logger.error();
            }
        });
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const now = new Date();
        const timeNow = now.getTime();
        if (!this.loggedIn || (this.iat + this.delta < timeNow)) {
            this.matSnack.open('Security token expired');
            this.store.dispatch(logoutAction());
            this.router.navigateByUrl('/login');
            return false;
        } else {
            return true;
        }
    }
}
