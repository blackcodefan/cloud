import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { ItemDetails } from 'core-lib';
import { SubSink } from 'subsink';
import { DatabankService } from '../../services';
import { DatabankState, renameItem } from '../../store';

@Component({
    selector: 'app-rename-data',
    templateUrl: './rename-data.component.html',
    styleUrls: [ './rename-data.component.scss' ],
})
export class RenameDataComponent implements OnInit {

    inputLength = 50;
    @Input() renameDataName!: string;
    @ViewChild('matInput') matInput!: ElementRef<HTMLInputElement>;
    private selectedAccount: any;
    private selectedItem: ItemDetails;
    private subsink = new SubSink();

    constructor(private matDialogRef: MatDialogRef<RenameDataComponent>, private snackbar: MatSnackBar, @Inject(MAT_DIALOG_DATA) public data: any, private store: Store<DatabankState>, private storageService: DatabankService) {
        this.renameDataName = data.item.name;
        this.selectedItem = data.item;
        this.selectedAccount = data.selectedAccount;
    }

    ngOnInit(): void {
        setTimeout((x: any) => {
            this.matInput.nativeElement.focus();
            this.matInput.nativeElement.select();
        }, 300);
    }

    closeModal() {
        this.matDialogRef.close();
    }

    setRenameDataName(event: any) {
        this.renameDataName = event.target.value;
        if (event.keyCode === 13) {
            this.saveRenameData();
        }
    }

    remove_dataName() {
        this.renameDataName = '';
    }

    saveRenameData() {
        this.renameDataName = this.renameDataName?.trim();
        if (this.renameDataName?.length > 0) {
            if (this.confirmNameExists(this.renameDataName)) {
                this.snackbar.open('The Folder name "' + this.renameDataName + '" is already taken. Please choose a different name', 'close');
            } else {
                this.subsink.sink = this.storageService.rename(this.selectedAccount.id, this.selectedItem.itemId, this.renameDataName).subscribe(res => {
                    this.store.dispatch(renameItem({ itemId: res.itemId, item: res }));
                    this.matDialogRef.close();
                }, error => {
                    this.snackbar.open('Error saving new name', 'close');
                });

            }
        } else {
            this.snackbar.open('The folder name can not be empty', 'close');
        }
    }

    // Findout the  name is duplicated or not
    confirmNameExists(BoxName: string): boolean {
        // const DuplicatedBoxItemIndex = this.currentElementList!.findIndex((x: any) => x.name == this.renameDataName);
        // return DuplicatedBoxItemIndex != -1;
        return false;
    }

    preventEnter(event: any) {
        return event.keyCode != 13;
    }
}
