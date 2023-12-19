import { SubSink } from 'subsink';
import { Label } from './../../model/email.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { EmailService } from '../../services/email.service';
import { Store } from '@ngrx/store';
import { removeLabel } from '../../store';

@Component({
    selector: 'app-confirm-to-delete-label',
    templateUrl: './confirm-to-delete-label.component.html',
    styleUrls: ['./confirm-to-delete-label.component.scss'],
})
export class ConfirmToDeleteLabelComponent implements OnInit, OnDestroy {
    label: Label;
    private subSink = new SubSink();

    constructor(
        private matDialogRef: MatDialogRef<ConfirmToDeleteLabelComponent>,
        private emailService: EmailService,
        private matSnack: MatSnackBar,
        private store: Store<any>
    ) {}

    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }

    ngOnInit(): void {}

    closeActionModal() {
        this.subSink.sink = this.emailService
            .removeEmailLabel(this.label.id)
            .subscribe(
                (res: any) => {
                    this.store.dispatch(removeLabel({ id: this.label.id }));
                },
                (error) => {
                    this.matSnack.open(
                        'Error on delete label',
                        error?.error?.message
                    );
                }
            );
        this.matDialogRef.close({ action: true });
    }
}
