import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { MoveToElement } from '../../models';
import { DatabankState, selectAllBoxes } from '../../store';

@Component({
    selector: 'app-moveto',
    templateUrl: './move-to.component.html',
    styleUrls: [ './move-to.component.scss' ],
})
export class MoveToComponent implements OnInit {
    boxList: any;
    selectedBoxID: string;
    @Input() _toMoveDataIDs!: Array<string>;
    @Output() _showBoxInfo = new EventEmitter<string>();
    @Output() _cancelMoveTo = new EventEmitter<string>();
    boxListViewMethod!: boolean;

    constructor(private store$: Store<DatabankState>, private cdr: ChangeDetectorRef, private matDialogRef: MatDialogRef<MoveToComponent>) {
        this.selectedBoxID = '';
        this.boxListViewMethod = true;
    }

    ngOnInit(): void {
        this.store$.pipe(select(selectAllBoxes)).subscribe(x => {
            this.boxList = x;
            this.cdr.detectChanges();
        });
    }

    showBoxInfo(boxId: string) {
        this.selectedBoxID = boxId;
        this.boxListViewMethod = false;
    }

    showBoxList() {
        this.boxListViewMethod = true;
    }

    submitMoveTo(moveToData: MoveToElement) {
        this.matDialogRef.close();
    }

}
