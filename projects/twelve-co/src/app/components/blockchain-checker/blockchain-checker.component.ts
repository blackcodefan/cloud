import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { BlockchainCheckerService, LoaderService } from 'core-lib';
import { SubSink } from 'subsink';

@Component({
    selector: 'app-blockchain-checker',
    templateUrl: './blockchain-checker.component.html',
    styleUrls: [ './blockchain-checker.component.scss' ],
})
export class BlockchainCheckerComponent implements OnInit {
// @ts-ignore
    file: File = null;
    // @ts-ignore
    signatureFile: File = null;
    fingerprintFormControl = new UntypedFormControl({ value: '', disabled: false }, [ Validators.required, Validators.minLength(20) ]);
    @ViewChild('testFile') testFileInput: HTMLInputElement;
    private subSink = new SubSink();
    private configSuccess: MatSnackBarConfig = {
        panelClass: [ 'style-success' ],
    };

    private configError: MatSnackBarConfig = {
        panelClass: [ 'style-error' ],
    };
    result: number = -1;

    constructor(private blockchainService: BlockchainCheckerService, private location: Location, private loader: LoaderService, private matSnack: MatSnackBar) {
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }

    validate() {

        if (this.file && this.signatureFile) {
            this.loader.showLoader();
            this.blockchainService.validateSignature(this.file, this.signatureFile).subscribe((res: boolean) => {
                if (res) {
                    this.result = 1;
                    this.matSnack.open('Document integrity verified', 'success', this.configSuccess);
                } else {
                    this.result = 2;
                    this.matSnack.open('Document integrity validation failed', 'error', this.configError);
                }
                this.loader.hideLoader();
            }, error => {
                console.log(error);
                this.result = 3;
                this.loader.hideLoader();
                this.matSnack.open('An error occured during validation', 'error', this.configError);
            });
        } else {
            this.matSnack.open('Please fill in all the fields');
        }

    }

    handleFileUpload(ev: any) {
        console.log('file chosen');
        this.file = ev.target.files[0];
        ev.target.value = null;
        console.log(this.file);
    }

    handleSignatureFileUpload(ev: any) {
        console.log('signature file chosen');
        this.signatureFile = ev.target.files[0];
        ev.target.value = null;
        console.log(this.file);
    }

    goBack() {
        this.location.back();
    }

    // handleTest(ev: any) {
    //   console.log('file chosen');
    //   this.testFile = ev.target.files[0];
    //   console.log(this.file);
    //
    // }

    // genSignature() {
    //   this.blockchainService.createsSignedFile(this.testFile).subscribe(res => {
    //     console.log('created signature: ', res);
    //   }, error => {
    //     console.log('error creating signature: ');
    //   });
    // }
}
