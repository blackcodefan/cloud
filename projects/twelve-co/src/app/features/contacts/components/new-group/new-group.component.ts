import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { ContactsService, Group, LoaderService, User } from 'core-lib';
import { switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { changeNewGroupStatus, ContactsState, setGroups } from '../../store';

@Component({
    selector: 'app-new-group',
    templateUrl: './new-group.component.html',
    styleUrls: [ './new-group.component.scss' ],
})
export class NewGroupComponent implements OnInit {
    isSubmit!: boolean;
    newGroupForm!: UntypedFormGroup;
    private subSink = new SubSink();
    private newGroupName: string;
    private subscriber: User;

    constructor(
        private dialogRef: MatDialogRef<NewGroupComponent>,
        private contactsService: ContactsService,
        private store: Store<ContactsState>,
        private loadingService: LoaderService,
        private matSnack: MatSnackBar,
    ) {
        this.newGroupForm = new UntypedFormGroup({
            name: new UntypedFormControl('', [ Validators.required ]),
        });
    }

    ngOnInit(): void {
    }

    saveNewGroup() {
        let newName = this.newGroupName.trim();
        if (newName.length < 1) {
            this.matSnack.open('Group name cannot be empty');
            return;
        }
        const newGroup: Group = {
            id: -10,
            name: this.newGroupName,
            subscriberId: this.subscriber.id,
        };
        this.loadingService.showLoader();
        this.store.dispatch(changeNewGroupStatus({ newGroupStatus: false }));
        this.subSink.sink = this.contactsService.createGroup(newGroup)
            .pipe(
                catchError(e => {
                    this.matSnack.open(`Could not create group${ e?.error?.message }`, 'error');
                    throw e;
                }),
                switchMap(_ => this.contactsService.listGroup()))
            .subscribe(groups => this.store.dispatch(setGroups({ groups })),
                err => {
                    this.matSnack.open(`Error fetching groups ${ err?.error?.message }`, 'error');
                });
    }

    public checkError(controlName: string, errorName: string) {
        return this.newGroupForm.controls[controlName].hasError(errorName);
    }
}
