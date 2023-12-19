import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { BusEvent, BusEventEnum, EventBusService, LoaderService } from 'core-lib';
import { distinctUntilChanged } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { changeSortByKey, ContactsState, selectSidebarStatus, selectSortDirection, selectSortKey, setSortDirection } from '../../../../store';

@Component({
    selector: 'app-contacts-right-component',
    templateUrl: './contacts-right-component.component.html',
    styleUrls: [ './contacts-right-component.component.scss' ],
})
export class ContactsRightComponentComponent implements OnInit {
    spinnerMessage: string = 'loading';
    sortKey: string;
    sortDirection: string;
    sidebarStatus: boolean;
    private subSink = new SubSink();

    constructor(private store$: Store<ContactsState>, private matDialog: MatDialog, private translate: TranslateService, private loader: LoaderService, private matSnack: MatSnackBar,
                private eventBus: EventBusService) {
    }

    ngOnInit(): void {
        this.subSink.sink = this.store$.pipe(select(selectSortKey), distinctUntilChanged()).subscribe((sortKey: string) => this.sortKey = sortKey);
        this.subSink.sink = this.store$.pipe(select(selectSortDirection), distinctUntilChanged()).subscribe((sortDirection: string) => this.sortDirection = sortDirection);
        this.subSink.sink = this.store$.pipe(select(selectSidebarStatus), distinctUntilChanged()).subscribe((selectSidebarStatus: boolean) => this.sidebarStatus = selectSidebarStatus);
    }

    showContactSearchBar() {
        console.log('emitting show searchbar');
        this.eventBus.emit(new BusEvent(BusEventEnum.SHOW_SEARCH_BAR));
    }


    updateSortByKey(sortKey: string) {
        this.store$.dispatch(changeSortByKey({ sortKey }));
    }

    updateSortDirection(sortDirection: string) {
        this.store$.dispatch(setSortDirection({ sortDirection }));
    }
}
