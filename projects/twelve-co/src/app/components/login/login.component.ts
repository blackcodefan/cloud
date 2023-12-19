import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LoaderService, LoggingService, setDecryptionStateAction, UserNotificationService, UserServiceService } from 'core-lib';
import { Options } from 'ngx-qrcode-styling';
import { combineLatest, interval, takeWhile } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { environment } from '../../../environments/environment';
import { LoginService, QrLoginService } from '../../services';
import { ForgottenPasswordService } from '../../services/forgotten-password.service';
import { LostDeviceService } from '../../services/lost-device.service';
import { loadSubaccounts, loadSubscriberAction, setLoggedInState, setSelectedAccount, State } from '../../store';

export const backgroundImageList = [
    '../../../assets/login-backgrounds/left-white/pexels-ron-lach-8762414-720p.mov',
];


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: [ './login.component.scss' ],
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
    loading: boolean;
    loadingCard: boolean = false;
    loginBackground: string = '';
    backgroundType: string = '';
    status: string = 'qrcode';
    emailFocus: boolean = false;
    passwordFocus: boolean = false;
    otpFocus: boolean = false;
    @ViewChild('loginPage') loginPage!: ElementRef;
    config: Options = {
        backgroundOptions: {
            color: 'transparent',
        },
    };
    emailInputFormControl = new UntypedFormControl({ value: null, disabled: false }, [ Validators.required, Validators.email ]);
    isBGVideo: boolean = false;
    loginForm: UntypedFormGroup = new UntypedFormGroup({
        email: new UntypedFormControl('', [ Validators.required, Validators.email ]),
        password: new UntypedFormControl('', [ Validators.required ]),
        code: new UntypedFormControl(null, [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(6),
        ]),
    });
    showQrLogin: boolean = false;
    qrData: { uriData: string; data: string };
    hidden: boolean = true;
    forgotPassword = false;
    lostDevice = false;
    formGroup: UntypedFormGroup;
    processing = false; // for calls to send email
    private subSink = new SubSink();
    private notDone: boolean = true;

    constructor(private loginService: LoginService, private notification: UserNotificationService, private logger: LoggingService, private matSnack: MatSnackBar,
                private router: Router, private store: Store<State>, private loader: LoaderService, private userService: UserServiceService,
                private qrLoginService: QrLoginService, private cdk: ChangeDetectorRef, private passwordService: ForgottenPasswordService,
                private lostDeviceService: LostDeviceService) {
        this.loading = false;
    }

    ngOnInit(): void {
        this.loginBackground = backgroundImageList[this.getRandomInt(backgroundImageList.length)];
        this.setBackgroundType();
        // if(environment.production){
            this.onQrLogin();
        // }

    }

    ngAfterViewInit() {
        this.loader.showLoader();
        if (!this.isBGVideo)
            this.loginPage.nativeElement.style.background = 'url("' + this.loginBackground + '") center/cover no-repeat fixed';
        setTimeout(() => {
            this.loader.hideLoader();
            this.loadingCard = true;
            // if (!environment.production) {
            //     this.debugLogin();
            // }
        }, 1000);

    }

    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }

    debugLogin() {
        // submit login form and handle repsonse

        this.loader.showLoader();
        this.notDone = false;
        const email = '12co1@mailinator.com';
        const password = 'Qq123!@#';
        const code = 123456;
        this.subSink.sink = this.loginService.login(email, password, code)
            .subscribe((result) => {
                    this.loader.hideLoader();
                    this.logger.info('Logged in successfully');
                    this.notDone = false;
                    this.handleLoginProcess();
                },
                (error: HttpErrorResponse) => {
                    this.loader.hideLoader();
                    this.logger.error('Error performing login: ', error);
                    this.notification.showError(
                        'Error performing login: ' + error?.error?.message,
                    );
                },
            );
        this.logger.info(this.loginForm.value);
    }


    login() {
        // submit login form and handle repsonse
        this.loginForm.markAllAsTouched();
        if (!this.loginForm.valid) {
            return;
        }
        this.loader.showLoader();
        this.notDone = false;
        const email = this.loginForm.controls.email.value;
        const password = this.loginForm.controls.password.value;
        const code = this.loginForm.controls.code.value;
        this.subSink.sink = this.loginService.login(email, password, code)
            .subscribe((result) => {
                    this.loader.hideLoader();
                    this.logger.info('Logged in successfully');
                    this.notDone = false;
                    this.handleLoginProcess();
                },
                (error: HttpErrorResponse) => {
                    this.loader.hideLoader();
                    this.logger.error('Error performing login: ', error);
                    this.notification.showError(
                        'Error performing login: ' + error?.error?.message,
                    );
                },
            );
        this.logger.info(this.loginForm.value);
    }

    onQrLogin() {
        this.showQrLogin = true;
        this.notDone = true;
        this.loader.showLoader();
        this.subSink.sink = this.qrLoginService.getLoginQrData().subscribe((qrData) => {
            this.qrData = qrData;
            this.loader.hideLoader();
            this.cdk.detectChanges();
            const source = interval(2000);
            this.subSink.sink = source.pipe(takeWhile(v => this.notDone)).subscribe(_ => {
                this.checkUserLogin(qrData.uuid);
            });
        }, error => {
            console.error(error);
            this.loader.hideLoader();
        });
    }

    /**
     * Pool to check user was logged in
     * @param code
     */
    checkUserLogin(code: string) {
        // check if login token is ready
        this.subSink.sink = this.qrLoginService.getLoginQrToken(code).subscribe((userLoginData) => {
            if (userLoginData !== null) {
                this.notDone = false;
                this.loader.showLoader();
                this.subSink.sink = this.loginService.qrLogin(userLoginData.token, userLoginData.username).subscribe((result) => {
                        this.loader.hideLoader();
                        this.logger.info('Logged in successfully');
                        this.store.dispatch(setLoggedInState({ loggedIn: true }));
                        this.handleLoginProcess();
                    },
                    (error: HttpErrorResponse) => {
                        this.loader.hideLoader();
                        this.logger.error('Error performing login: ', error);
                        this.notification.showError(
                            'Error performing login: ' + error?.error?.message,
                        );
                    },
                );
            }
        });
    }

    confirmForgotPassword() {
        this.formGroup = new UntypedFormGroup({
            email: new UntypedFormControl({ value: null, disabled: false }, [ Validators.required, Validators.email ]),
        });
        this.forgotPassword = true;
        // this.router.navigate([ '/reset' ]);
    }

    confirmLostDevice() {
        this.formGroup = new UntypedFormGroup({
            email: new UntypedFormControl({ value: null, disabled: false }, [ Validators.required, Validators.email ]),
        });
        this.lostDevice = true;
    }

    onUserLogin() {
        this.showQrLogin = false;
        this.notDone = false;
    }

    dismissLostOrForgot() {
        // this.formGroup = null;
        this.lostDevice = false;
        this.forgotPassword = false;
    }

    handleResetPassword() {
        const email = this.formGroup.controls.email.value;
        this.passwordService.resetPassword(email).subscribe(res => {
            this.matSnack.open('An email was sent to your mailbox with the steps necessary to reset your password');
            this.router.navigateByUrl('/');
        }, error => {
            this.matSnack.open('Error ressetting the password: ', error?.error?.message);
        });

    }

    handleLostDevice() {
        const email = this.formGroup.controls.email.value;
        this.lostDeviceService.replaceLostDevice(email).subscribe(res => {
            this.matSnack.open('An email was sent to your registered mailbox with the steps necessary to replace your lost device.');
            this.router.navigateByUrl('/');
        }, error => {
            this.matSnack.open('Error in replace your lost device: ', error?.error?.message);
        });
    }

    focusInput(email: string) {
        switch (email) {
            case 'email':
                this.emailFocus = true;
                break;
            case 'password':
                this.passwordFocus = true;
                break;
            case 'otp':
                this.otpFocus = true;
                break;
        }
    }

    keytab($event: any) {
        let element = $event.srcElement.nextElementSibling; // get the sibling element

        if (element == null)  // check if its null
            return;
        else
            element.focus();   // focus if not null
    }

    loginSubmit() {

    }

    getRandomInt(max: number) {
        return Math.floor(Math.random() * max);
    }

    setBackgroundType() {
        if (this.loginBackground.includes('center-black')) {
            this.backgroundType = 'login-card-center-black';
        }
        if (this.loginBackground.includes('left-black')) {
            this.backgroundType = 'login-card-left-black';
        }
        if (this.loginBackground.includes('center-white')) {
            this.backgroundType = 'login-card-center-white';
        }
        if (this.loginBackground.includes('left-white')) {
            this.backgroundType = 'login-card-left-white';
        }
    }

    /**
     * Configure selected account
     * @param subaccounts
     * @private
     */
    private setUpSubAccounts(subaccounts) {
        this.logger.info('loading subaccounts : ', subaccounts);
        if (subaccounts && subaccounts.length > 0) {
            if (subaccounts.length == 1) {
                const selectedAccount = subaccounts[0];
                // if (!selectedAccount.allowDecrypt) {
                //     this.matSnack.open('Box icons will be available when decryption is enabled', 'warning');
                // }
                this.store.dispatch(setSelectedAccount({ selectedAccount }));
                this.store.dispatch(setDecryptionStateAction({ decryptState: { msgId: null, accountId: selectedAccount.id, allowDecrypt: selectedAccount.allowDecrypt } }));
            }
            this.store.dispatch(loadSubaccounts({ subaccounts }));
        }
    }

    private handleLoginProcess() {
        this.subSink.sink = combineLatest(
            this.userService.fetchSubscriberInformation().pipe(catchError(error => {
                console.log(error);
                this.logger.error('Error fetching subscriber information for current user');
                this.loader.hideLoader();
                this.notification.showError('Error fetching account information');
                throw error;
            })),
            this.userService.fetchSubAccounts().pipe(catchError(error => {
                this.loader.hideLoader();
                this.logger.error('Error fetching subaccount information for current user');
                this.notification.showError('Error fetching accounts information');
                throw error;
            })))
            .subscribe(([ subscriber, subaccounts ]) => {
                this.loader.hideLoader();
                this.store.dispatch(setLoggedInState({ loggedIn: true }));
                this.logger.info('loading subscriber : ', subscriber);
                this.store.dispatch(loadSubscriberAction({ subscriber }));
                this.setUpSubAccounts(subaccounts);
                this.router.navigate([ '/apps' ]);
            });
    }

    handleOtherOption() {
        this.processing = true;
        if (this.status === 'forgot') {
            this.logger.info('handling forgot case');
            this.subSink.sink = this.loginService.handleForgotPassword(this.emailInputFormControl.value?.trim()).subscribe(res => {
                this.processing = false;
                this.emailInputFormControl.setValue(null);
                this.matSnack.open('If the address was used to create an account you will receive an email with the instructions for resetting your password');
            }, error => {
                console.error(error);
                this.processing = false;
                this.matSnack.open(`could not process request ${ error?.error?.message || '' }`);
            });


        } else {
            this.subSink.sink = this.loginService.handleAddNewDevice(this.emailInputFormControl.value?.trim()).subscribe(res => {
                this.emailInputFormControl.setValue(null);
                this.processing = false;
                this.matSnack.open('If the address was used to create an account you will receive an email with the instructions for resetting your password');
            }, error => {
                this.processing = false;
                this.matSnack.open(`could not process request ${ error?.error?.message }`);
            });
            this.matSnack.open('If the address was used to create an account you will receive an email with the instructions for adding a new device', 'info');
            this.status='qrcode'
            this.logger.info('handling device lost case');
        }
    }
}
