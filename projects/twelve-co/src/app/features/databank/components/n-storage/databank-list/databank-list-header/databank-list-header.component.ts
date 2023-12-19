import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { DatabankState, setIsNewBoxStatus } from '../../../../store';

@Component({
    selector: 'app-databank-list-header',
    templateUrl: './databank-list-header.component.html',
    styleUrls: [ './databank-list-header.component.scss' ],
})
export class DatabankListHeaderComponent implements OnInit {

    constructor(private matDialogService: MatDialog, private store$: Store<DatabankState>) {
    }

    ngOnInit(): void {
    }

    createNewBox() {
        this.store$.dispatch(setIsNewBoxStatus({ isNewBox: true }));

    }
}
