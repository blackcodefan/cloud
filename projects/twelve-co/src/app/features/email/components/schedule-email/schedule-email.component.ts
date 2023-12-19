import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { DomService } from 'core-lib';
import { pipe } from 'rxjs';
import { EmailRightSidebarComponent } from '../../layouts';
import { Label } from '../../model';

@Component({
    selector: 'app-schedule-email',
    templateUrl: './schedule-email.component.html',
    styleUrls: [ './schedule-email.component.scss' ],
})
export class ScheduleEmailComponent implements OnInit {

    selected: Date;
    today = new Date();
    labelId: string;

    constructor(private matCurrentDialog: MatDialogRef<ScheduleEmailComponent>, private domService: DomService, private store: Store<any>) {
        this.selected = new Date();
        // this.store.select(pipe(getFixedLabels)).subscribe((labels: Array<Label>) => {
        //     this.labelId = labels[3].id;
        // });
    }

    ngOnInit(): void {
        this.domService.appendComponentToRightSide(EmailRightSidebarComponent);
    }

    close_Modal() {
        this.matCurrentDialog.close();
    }
}
