import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { SubSink } from 'subsink';
import { Calendar } from '../../../model';
import { CalendarState, selectAvailableCalendars } from '../../../store';

@Component({
    selector: 'app-create-calendar',
    templateUrl: './create-calendar.component.html',
    styleUrls: [ './create-calendar.component.scss' ],
})
export class CreateCalendarComponent implements OnInit, OnDestroy {
    formGroup: UntypedFormGroup;
    private subSink = new SubSink();
    private calendars = new Array<Calendar>();

    constructor(private ref: MatDialogRef<CreateCalendarComponent>, private store: Store<CalendarState>, private formBuilder: UntypedFormBuilder, private matSnack: MatSnackBar) {
    }

    ngOnInit(): void {
        this.formGroup = this.formBuilder.group({
            calendarName: [ '', Validators.required ],
        });

        this.subSink.sink = this.store.pipe(select(selectAvailableCalendars)).subscribe(res => {
            this.calendars = res;
        });
    }

    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }

    closeModal() {
        this.ref.close();
    }

    createCalendar() {
        if (this.formGroup.valid) {
            if (this.checkNameExists()) {
                this.matSnack.open('Calendar with same name already exists');
            }
        } else {
            this.matSnack.open('calendar name must be at least 6 characters long');
        }
    }

    private checkNameExists() {
        let value = this.formGroup.controls.calendarName.value();
        return this.calendars.map(c => c.name).filter(name => name.trim().toLowerCase() === value.toLowerCase().trim()).length !== 0;
    }
}
