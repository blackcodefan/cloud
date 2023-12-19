import { Label, LabelUpdate } from './../../model/email.model';
import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { LoaderService } from 'core-lib';
import { EmailService } from '../../services/email.service';
import { addNewLabel, EmailState, updateLabel } from '../../store';

@Component({
    selector: 'app-new-label',
    templateUrl: './new-label.component.html',
    styleUrls: [ './new-label.component.scss' ],
})
export class NewLabelComponent implements OnInit {
    isSubmit!: boolean;
    newLabelForm!: UntypedFormGroup;
    label: Label;
    isUpdate: boolean = false;

    constructor(
        private dialogRef: MatDialogRef<NewLabelComponent>,
        private emailService: EmailService,
        private store: Store<EmailState>,
        private loadingService: LoaderService,
        private matSnack: MatSnackBar,
    ) {
        this.newLabelForm = new UntypedFormGroup({
            label: new UntypedFormControl('', [ Validators.required ]),
        });
    }

    ngOnInit(): void {
        if(this.label !== undefined && this.label !== null) {
            this.isUpdate = true;
            this.newLabelForm.controls['label'].setValue(this.label.name);
        }
    }

    saveLabel() {
        if(this.isUpdate) {
            this.updateLabel();
        } else {
            this.saveNewLabel();
        }
    }

    updateLabel() {
        this.isSubmit = true;
        if (this.newLabelForm.valid) {
            this.loadingService.showLoader();
            const updLabel: LabelUpdate = {
                id: this.label.id,
                name:  this.newLabelForm.value.label
            }
            this.emailService.updateLabelForAccount(updLabel).subscribe((label: any) => {
                if(label) {
                    const data: Label = {
                        name: label.name,
                        id: label.id,
                        order: label.order,
                        isFixed: false
                    };
                    this.store.dispatch(updateLabel({ label: data }));
                    this.loadingService.hideLoader();
                    this.dialogRef.close();
                } else {
                    this.loadingService.hideLoader();
                    this.matSnack.open('Error update label');
                }
            }, error => {
                this.loadingService.hideLoader();
                this.matSnack.open('Error update label', error?.error?.message);
            });
        }
    }

    saveNewLabel() {
        this.isSubmit = true;
        if (this.newLabelForm.valid) {
            this.loadingService.showLoader();
            this.emailService.addLabelForAccount(this.newLabelForm.value.label).subscribe((label: any) => {
                if(label) {
                    const data: Label = {
                        name: label.name,
                        id: label.id,
                        order: label.order,
                        isFixed: false
                    };
                    this.store.dispatch(addNewLabel({ label: data }));
                    this.loadingService.hideLoader();
                    this.dialogRef.close();
                } else {
                    this.loadingService.hideLoader();
                    this.matSnack.open('Error saving label');
                }
            }, error => {
                this.loadingService.hideLoader();
                this.matSnack.open('Error saving label');
            });
        }
    }


    public checkError(controlName: string, errorName: string) {
        return this.newLabelForm.controls[controlName].hasError(errorName);
    }
}
