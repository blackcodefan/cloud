import { HttpEvent, HttpHandler, HttpInterceptor, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { filter, first, mergeMap } from 'rxjs/operators';
import { UserAndToken } from '../model';
import { selectAuthToken, selectAuthTokenAndCurrentUser, State } from '../store';

// import { LoggingService } from 'core-lib';

@Injectable({
    providedIn: 'root',
})
export class TokenInterceptorService implements HttpInterceptor {

    /**
     * Map of contexts for API endpoints.
     */
    public REGISTRATIONS_CONTEXT = '/registrations';
    public BILLING_CUSTOMER_CONTEXT = 'billing/customer';
    public LANGUAGES_CONTEXT = 'languages';
    public CAPTCHA_CONTEXT = '/captcha';
    public ASSETS = 'assets/';
    public QR = 'assets/';
    public QUESTIONS = 'questions';
    public COUNTRIES = '/countries';
    public REGISTER_QR = 'api/v1/auth/otp/18/qr';
    private HEADER_AUTH = 'Authorization';
    private HEADER_ACCOUNT = 'Account';
    private BEARER = 'Bearer ';
    private token$: Observable<string>;
    // @ts-ignore
    private token: string;

    constructor(private store: Store<State>/*, private logger: LoggingService*/) {
        this.token$ = this.store.pipe(select(selectAuthToken));
        this.token$.subscribe((crtToken: string) => this.token = crtToken);
    }

    public isPublicEndpoint(url: string = ''): boolean {
        return (url.toLowerCase().indexOf(this.REGISTRATIONS_CONTEXT) > -1)
            || (url.toLowerCase().indexOf(this.BILLING_CUSTOMER_CONTEXT) > -1)
            || (url.toLowerCase().indexOf(this.LANGUAGES_CONTEXT) > -1)
            || (url.toLowerCase().indexOf(this.CAPTCHA_CONTEXT) > -1)
            || (url.toLowerCase().indexOf(this.ASSETS) > -1)
            || (url.toLowerCase().indexOf('/login') > -1)
            || (url.toLowerCase().indexOf('/password') > -1)
            || (url.toLowerCase().indexOf('/blockchain') > -1)
            || (url.toLowerCase().indexOf('/users-login') > -1)
            || (url.toLowerCase().indexOf(this.QR) > -1)
            || (url.toLowerCase().indexOf(this.QUESTIONS) > -1)
            || (url.toLowerCase().indexOf(this.COUNTRIES) > -1)
            || (url.toLowerCase().indexOf('/lost-device') > -1);
    }

    /**
     * Intercepts all HTTP requests and adds the JWT token to the request's header if the URL
     * is a REST endpoint and not login or logout.
     */
    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const isPublicEndpoint = this.isPublicEndpoint(request.url);
        // NOTE: Only add the auth token to non-Auth REST endpoints.
        if (!isPublicEndpoint) {
            return this.addToken(request).pipe(
                first(),
                mergeMap((requestWithToken: HttpRequest<any>) => next.handle(requestWithToken)),
            );
        } else {
            return next.handle(request);
        }
    }

    /**
     * Adds the JWT token to the request's header.
     */
    private addToken(request: HttpRequest<any>): Observable<HttpRequest<any>> {
        // NOTE: DO NOT try to immediately setup this selector in the constructor or as an assignment in a
        // class member variable as there's no stores available when this interceptor first fires up and
        // as a result it'll throw a runtime error.

        return this.store.pipe(
            select(selectAuthTokenAndCurrentUser),
            filter((tkn: UserAndToken) => tkn?.authToken?.length > 0),
            mergeMap((userAndToken: UserAndToken) => {
                // let params = request.params;
                // let paramsKeys = request.params.keys();
                // let paramsValues = params.keys().map(key => request.params.get(key));
                if(userAndToken.userId){
                    request = request.clone({
                        headers: request.headers.set(this.HEADER_AUTH, `${ this.BEARER }${ userAndToken.authToken }`).set(this.HEADER_ACCOUNT, userAndToken.userId.toString()),
                        params: userAndToken.userId ? (request.params ? request.params : new HttpParams()).set('acc', userAndToken.userId) : request.params,
                    })
                }else{
                    request = request.clone({
                        headers: request.headers.set(this.HEADER_AUTH, `${ this.BEARER }${ userAndToken.authToken }`),
                        params: userAndToken.userId ? (request.params ? request.params : new HttpParams()).set('acc', userAndToken.userId) : request.params,
                    })
                }
                return of(request);
            }),
        );
    }
}
