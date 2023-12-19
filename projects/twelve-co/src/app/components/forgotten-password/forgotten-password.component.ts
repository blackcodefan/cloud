import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from '../../../../../core-lib/src/lib/services';
import { ForgottenPasswordService } from '../../services/forgotten-password.service';

@Component({
    selector: 'app-forgotten-password',
    templateUrl: './forgotten-password.component.html',
    styleUrls: [ './forgotten-password.component.scss' ],
})
export class ForgottenPasswordComponent implements OnInit {
    private token: string;
    formGroup: UntypedFormGroup;
    passwordPattern = '^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*[#$@!%&*?.]).{8,}$';
    readonly minPwdLength = 8;
    readonly tokenLength = 8;
    tokenInvalid = false;
    showPassword = false;

    constructor(private route: ActivatedRoute, private location: Location, private loader: LoaderService,
                private fb: UntypedFormBuilder, private matSnack: MatSnackBar,
                private passwordService: ForgottenPasswordService, private router: Router) {
    }

    ngOnInit(): void {
        const pmap = this.route.snapshot.queryParamMap;
        this.token = pmap.get('token') as string;
        console.log(this.token);
        if (!this.token || this.token.length !== 36) {
            this.tokenInvalid = true;
        }
        this.buildFormGruop();
    }

    handleResetPassword() {
        const password = this.formGroup.controls.password.value as string;
        const token = this.formGroup.controls.token.value as string;
        if (password && password.length >= 8) {
            this.loader.showLoader();
            this.passwordService.updatePassword(token, password).subscribe(res => {
                this.loader.hideLoader();
                this.router.navigateByUrl('login');
            }, error => {
                this.loader.hideLoader();
                this.matSnack.open('error processing password change');
                console.error(error);
            });
        } else {
            this.matSnack.open('Passwords do not match');
        }
    }


    private buildFormGruop() {
        this.formGroup = this.fb.group({
            token: new UntypedFormControl({ value: this.token, disabled: false }, [ Validators.required, Validators.minLength(this.tokenLength) ]),
            password: new UntypedFormControl({ value: '', disabled: false }, [ Validators.required, Validators.minLength(this.minPwdLength), Validators.pattern(this.passwordPattern) ]),
        });
    }

    handleDismiss() {
        this.location.back();
    }
}
