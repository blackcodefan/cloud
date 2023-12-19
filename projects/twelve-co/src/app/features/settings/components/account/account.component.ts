import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import {
    AccountInformationDto,
    AccountsService,
    AccountSummary,
    Country,
    CountryService,
    Language,
    LanguageService,
    LoaderService,
    LoggingService,
    setDecryptionStateAction,
    TimeZone,
    User,
    UserServiceService,
} from 'core-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { combineLatest } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { environment } from '../../../../../environments/environment';
import {
    loadSubaccounts,
    loadSubscriberAction,
    selectOwnerImage,
    selectSelectedAccount,
    selectSelectedSubscriber,
    setLoggedInState,
    setOwnerImage,
    setSelectedAccount,
    State,
} from '../../../../store';
import { TimeZoneService } from '../../services/time-zone.service';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: [ './account.component.scss' ],
})
export class AccountComponent implements OnInit, OnDestroy {
    languages = [ { code: 'es', description: 'Spanish' }, { code: 'ro', description: 'Romanian' }, { code: 'en', description: 'English' }, { code: 'cn', description: 'Chineese' } ];
    selected!: string;
    formGroup: UntypedFormGroup;
    countries: Array<Country>;
    timezones: Array<TimeZone>;
    selectedAccountImage: string;
    private BASE = environment.apiUrl;
    private selectedAccount: AccountSummary;
    private subSink = new SubSink();
    private subscriber: User;

    constructor(private matSnack: MatSnackBar, private translateService: TranslateService, private accountsService: AccountsService, private logger: LoggingService, private http: HttpClient,
                private spinner: NgxSpinnerService, private store: Store<State>, private countryService: CountryService, private loader: LoaderService, private languageService: LanguageService,
                private timezoneService: TimeZoneService, private userService: UserServiceService) {
    }

    ngOnInit(): void {
        this.subSink.sink = this.store.pipe(select(selectOwnerImage)).subscribe(img => this.selectedAccountImage = img);
        this.store.pipe(select(selectSelectedAccount)).subscribe(s => this.selectedAccount = s);
        console.log(this.translateService.currentLang);
        this.selected = this.languages.filter(l => l.code === this.translateService.currentLang)[0].code; // hacky but fast
        console.log(this.selected);
        this.formGroup = new UntypedFormGroup({
            firstName: new UntypedFormControl({ val: '', disabled: false }, [ Validators.required ]),
            lastName: new UntypedFormControl({ val: '', disabled: false }, [ Validators.required ]),
            email: new UntypedFormControl({ val: '', disabled: false }, [ Validators.required ]),
            country: new UntypedFormControl({ val: '', disabled: false }, [ Validators.required ]),
            language: new UntypedFormControl({ val: '', disabled: false }, [ Validators.required ]),
            timezone: new UntypedFormControl({ val: '', disabled: false }, [ Validators.required ]),
        });
        this.subSink.sink = this.store.pipe(select(selectSelectedSubscriber)).subscribe((val: User) => {
            this.subscriber = val;
            this.formGroup.controls.firstName.patchValue(val.firstName);
            this.formGroup.controls.lastName.patchValue(val.lastName);
            this.formGroup.controls.email.patchValue(val.email);
            this.formGroup.controls.timezone.patchValue(val.timeZone);
            this.formGroup.updateValueAndValidity();
        });
        this.subSink.sink = this.countryService.getCountries().subscribe((val: Array<Country>) => {
            this.countries = val;
            const cval: Country = val.filter(c => c.id === this.subscriber.country.id)?.[0];
            console.log('cval: ', cval);
            this.formGroup.controls.country.patchValue(cval.id || null);
        });
        this.subSink.sink = this.timezoneService.getTimeZones().subscribe(timezones => this.timezones = timezones);
        this.subSink.sink = this.languageService.getLanguages().subscribe((val: Array<Language>) => {
            this.languages = val;
            let userLanguage = val.filter(c => c.code === this.subscriber.language)[0] ?? null;
            console.log('matching languages: ', userLanguage);
            this.formGroup.controls.language.patchValue(userLanguage?.code);
        });
    }


    // accounts/{accountId}/photos

    uploadAvatar($event: any) {
        let reader = new FileReader();
        let file = $event.target.files[0];
        reader.readAsDataURL(file);
        reader.onload = () => {
            let img = { photoType: 'image', pictureType: 'UPLOAD', image: reader.result };
            this.subSink.sink = this.http.post(`${ this.BASE }accounts/${ this.selectedAccount.id }/photos`, img).subscribe(res => {
                this.matSnack.open('Uploaded avatar succesfully', 'close');
                this.subSink.sink = this.accountsService.getPhotoForAccount(this.selectedAccount.id).subscribe((accountPhotoDto) => {
                    //@ts-ignore
                    this.store.dispatch(setOwnerImage({ ownerImage: accountPhotoDto.image }));
                }, error => console.info('error fetching image for account'));
            }, error => {
                this.matSnack.open(`Error uploading avatar image for account  ${ error?.error?.message }`, 'error');
            });
        };
        reader.onerror = (error) => {
            this.matSnack.open(`Error `, 'error');
        };

    }

    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }


    saveChanges() {
        /*
         this.formGroup = new FormGroup({
            firstName: new FormControl({ val: '', disabled: false }, [ Validators.required ]),
            lastName: new FormControl({ val: '', disabled: false }, [ Validators.required ]),
            email: new FormControl({ val: '', disabled: false }, [ Validators.required ]),
            country: new FormControl({ val: '', disabled: false }, [ Validators.required ]),
            language: new FormControl({ val: '', disabled: false }, [ Validators.required ]),
            timezone: new FormControl({ val: '', disabled: false }, [ Validators.required ]),
        });
        this.subSink.sink = this.store.pipe(select(selectSelectedSubscriber)).subscribe((val: User) => {
            this.subscriber = val;
            this.formGroup.controls.firstName.patchValue(val.firstName);
            this.formGroup.controls.lastName.patchValue(val.lastName);
            this.formGroup.controls.email.patchValue(val.email);
            this.formGroup.controls.timezone.patchValue(val.timeZone);
            this.formGroup.updateValueAndValidity();
        });
         */
        let accountDetails = {};
        accountDetails['accountId'] = this.selectedAccount.id;
        accountDetails['accountName'] = this.selectedAccount.accountName;
        accountDetails['firstName'] = this.formGroup.controls.firstName.value;
        accountDetails['lastName'] = this.formGroup.controls.lastName.value;
        accountDetails['countryId'] = this.formGroup.controls.country.value;
        accountDetails['timeZone'] = this.formGroup.controls.timezone.value;
        accountDetails['language'] = this.formGroup.controls.language.value;
        console.debug(accountDetails);
        this.subSink.sink = this.userService.updateAccountDetails(accountDetails as AccountInformationDto).subscribe(res => {
            this.matSnack.open('Account details updated');
            this.subSink.sink = combineLatest(
                this.userService.fetchSubscriberInformation().pipe(catchError(error => {
                    console.log(error);
                    this.logger.error('Error fetching subscriber information for current user');
                    this.loader.hideLoader();
                    throw error;
                })),
                this.userService.fetchSubAccounts().pipe(catchError(error => {
                    this.loader.hideLoader();
                    this.logger.error('Error fetching subaccount information for current user');
                    throw error;
                })))
                .subscribe(([ subscriber, subaccounts ]) => {
                    this.loader.hideLoader();
                    this.store.dispatch(setLoggedInState({ loggedIn: true }));
                    this.logger.info('loading subscriber : ', subscriber);
                    this.setUpSubAccounts(subaccounts);
                    this.store.dispatch(loadSubscriberAction({ subscriber }));
                });
        }, (error) => {
            console.error(error);
            this.matSnack.open('Error updating account details');
        });
    }

    private setUpSubAccounts(subaccounts) {
        this.logger.info('loading subaccounts : ', subaccounts);
        if (subaccounts && subaccounts.length > 0) {
            if (subaccounts.length == 1) {
                const selectedAccount = subaccounts[0];
                this.store.dispatch(setSelectedAccount({ selectedAccount }));
                this.store.dispatch(setDecryptionStateAction({ decryptState: { msgId: null, accountId: selectedAccount.id, allowDecrypt: selectedAccount.allowDecrypt } }));
            }
            this.store.dispatch(loadSubaccounts({ subaccounts }));
        }
    }
}
