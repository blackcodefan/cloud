import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { AccountSummary, ItemDetails, ItemOperationOptionEnum, ItemReportDto, ItemsCopyInfo } from 'core-lib';
import { SubSink } from 'subsink';
import { StorageExceptionCodeEnum } from 'core-lib';
import { MoveToElement } from '../../../models';
import { DatabankService } from '../../../services';
import { DatabankState, removeDataId, selectBoxContent, selectAllBoxes, selectSelectedAccount } from '../../../store';

@Component({
    selector: 'app-moveto-boxlist',
    templateUrl: './move-to-boxlist.component.html',
    styleUrls: [ './move-to-boxlist.component.scss' ],
})
export class MoveToBoxlistComponent implements OnInit {
    @Input() toMoveItemIds: Array<string> = [];
    @Output() submitMoveTo = new EventEmitter<MoveToElement>();
    @Output() showBoxInfo = new EventEmitter<string>();
    @Output() CancelMoveTo = new EventEmitter<string>();

    boxList: Array<ItemDetails> = [];
    loading$: boolean;
    selectedDestinationBox: ItemDetails;
    selectedItemsToMove: Array<ItemDetails> = [];
    private subSink = new SubSink();
    private selectedAccount: AccountSummary;

    constructor(
        private store: Store<DatabankState>, private cdr: ChangeDetectorRef, private matDialogRef: MatDialogRef<MoveToBoxlistComponent>, private databankService: DatabankService, private matSnack: MatSnackBar) {
        this.loading$ = false;

    }

    ngOnInit(): void {
        this.subSink.sink = this.store.pipe(select(selectAllBoxes)).subscribe((x) => {
            this.boxList = x;
            this.loading$ = true;
            this.cdr.detectChanges();
        });

        this.subSink.sink = this.store.pipe(select(selectSelectedAccount)).subscribe((selectedAccount: AccountSummary) => {
            this.selectedAccount = selectedAccount;
        });
        this.subSink.sink = this.store.pipe(select(selectBoxContent)).subscribe((folderContents: ItemDetails[]) => {
            this.selectedItemsToMove = folderContents.filter(ff => this.toMoveItemIds.indexOf(ff.itemId) !== -1);
            console.log('files to move: ', this.selectedItemsToMove);


        });
    }

    goToBoxInfo(boxId: string) {
        this.showBoxInfo.emit(boxId);
    }

    submitMoveToData() {
        let up: ItemsCopyInfo = { accountId: this.selectedAccount?.id || -1, targetParentId: this.selectedDestinationBox.itemId, items: [] };
        up.items = this.selectedItemsToMove.map(r => {
            return { itemId: r.itemId, type: r.type, name: r.name, modified: r.lastAccess, usedSpace: r.usedSpace, ownerId: r.ownerId, itemOption: ItemOperationOptionEnum.REPLACE };
        });
        this.databankService.moveItems(up).subscribe((res: Array<ItemReportDto>) => {
            const fileIds = res.filter(f => f.exceptionCode === StorageExceptionCodeEnum.OK).map(f => f.item.itemId); // items moved succesfully
            this.store.dispatch(removeDataId({ fileIds }));
        }, error => {
            this.matSnack.open(`Error moving items ${ error?.error?.message ? error?.error?.message : '' }`);
        });
        this.submitMoveTo.emit();
    }

    selectBox(box: ItemDetails) {
        this.selectedDestinationBox = box;
    }

    closeModal() {
        this.matDialogRef.close();
    }

}
