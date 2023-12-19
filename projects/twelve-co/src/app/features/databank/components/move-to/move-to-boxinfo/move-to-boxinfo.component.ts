import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { ItemDetails } from 'core-lib';
import { FileElement, MoveToElement } from '../../../models';
import { DatabankState, retriveSingleBox, updateCurrentMoveToDataList } from '../../../store';
import { MoveToCreateNewFolderComponent } from '../move-to-create-new-folder/move-to-create-new-folder.component';

@Component({
    selector: 'app-moveto-boxinfo',
    templateUrl: './move-to-boxinfo.component.html',
    styleUrls: [ './move-to-boxinfo.component.scss' ],
})
export class MoveToBoxinfoComponent implements OnInit {
    @Input() selectedBoxID!: string;
    @Input() toMoveDataIDs!: Array<string>;
    @Output() submitMoveTo = new EventEmitter<MoveToElement>();
    @Output() backToBoxList = new EventEmitter<string>();
    boxId!: string;
    boxInfo?: ItemDetails;
    destinationFolderID: string;
    _toMoveDataIDs!: Array<string>;
    isCreateNewFolder: boolean;
    newFolderName!: string;
    currentFolderName!: string;
    currentMoveToRootID: any;
    currentMoveToRoot!: any;
    selectedDataID: string;

    constructor(
        private store$: Store<DatabankState>,
        private cdr: ChangeDetectorRef,
        private _matDialogService: MatDialog,
        private _snackBar: MatSnackBar,
        private matDialogRef: MatDialogRef<MoveToBoxinfoComponent>,
    ) {
        this.destinationFolderID = '';
        this.currentMoveToRootID = 'root';
        this.selectedDataID = '';
        this.isCreateNewFolder = false;
    }

    ngOnInit(): void {
        this._toMoveDataIDs = this.toMoveDataIDs;
        this.boxId = this.selectedBoxID;
        this.store$.pipe(select(retriveSingleBox(this.boxId))).subscribe((x: any) => {
            this.boxInfo = x;
            this.cdr.detectChanges();
        });
        this.updateCurrentMoveToDataList();
    }

    // when user double click folder
    goToFolderInfo(dataID: any) {
        // const currentMoveToRoot = this.boxInfo?.moveToElementList.find(x => x.id == dataID);
        // this.navigateToFolderByRoot(currentMoveToRoot!, -2);
        // this.selectedDataID = '';
    }

    navigateToFolderByRoot(currentMoveToRoot: FileElement | null, index: number) {
        if ((currentMoveToRoot == null) && (index != -1)) {
            this.backToBoxList.emit();
        } else {
            if (index == -1) {
                this.currentMoveToRootID = 'root';
                this.currentFolderName = this.boxInfo!.name;
                // this.currentMoveToRoot = new Array<PathElement>();
                this.currentMoveToRoot = new Array<string>();
            } else {
                this.currentMoveToRootID = currentMoveToRoot!.id;
                this.currentFolderName = currentMoveToRoot!.name;
                this.currentMoveToRoot = currentMoveToRoot;
            }
            const boxId = this.boxId;
            // const currentMoveToPath = this.pushToPath(this.boxInfo!.moveTocurrentPath, this.currentMoveToRoot.name, this.currentMoveToRoot, index);
            // this.store$.dispatch(updateMoveToCurrentRoot({ boxId, currentMoveToRoot, currentMoveToPath }));
            this.updateCurrentMoveToDataList();
        }
    }

    // get the current breadcumb path
    pushToPath(path: any, folderName: string, fileElement: FileElement, index: number) {
        let p = path;
        p = Object.assign([], p);
        const CurrentElement = {
            path: folderName,
            element: fileElement,
        };
        if (index == -2) {
            p.push(CurrentElement);
        } else {
            const DeleteCount = p.length - (index + 1);
            p.splice(index + 1, DeleteCount);
        }
        return p;
    }

    // when user click create new folder button
    createNewFolder() {
        const CurrentMoveToPopup = document.getElementsByClassName('moveTo-css')[0] as HTMLElement;
        CurrentMoveToPopup.style.display = 'none';
        const moveToDialog = this._matDialogService.open(MoveToCreateNewFolderComponent, { panelClass: 'move-to-create-newFolder' });
        // moveToDialog.componentInstance.newFolderName = this.createPreFieldName();
        // moveToDialog.componentInstance.currentElementList = this.boxInfo!.moveToElementList;
        moveToDialog.afterClosed().subscribe(x => {
            if (x.folderName) {
                this.newFolderName = x.folderName;
                CurrentMoveToPopup.style.display = 'block';
                this.saveNewFolder();
            }
        });
        /*setTimeout((x: any) => {
          let newFolderInput = document.getElementById('newFolderInput') as HTMLInputElement;
          newFolderInput.focus();
          newFolderInput.select();
        }, 150)*/
    }

    changeNewFolderName(evt: any) {
        this.newFolderName = evt.target.value;
        if (evt.keyCode === 13) {
            this.saveNewFolder();
        }
    }

    saveNewFolder() {

    }

    // when user click cancel create new folder
    cancelCreateNewFolder() {
        this.isCreateNewFolder = false;
    }

    preventEnter(event: any) {
        return event.keyCode != 13;

    }

    // get untitled folder name
    createPreFieldName() {
        /*
        let NewFolderIncludesList = '';
        // let NewFolderIncludesList = this.boxInfo!.moveToElementList.filter(e => {
        //     return e.name.startsWith('Untitled folder')
        //         && ((!isNaN(parseInt(e.name.replace('Untitled folder', ''))))
        //             || (isNaN(parseInt(e.name.replace('Untitled folder', ''))) && (e.name === 'Untitled folder')));
        // });
        let NewFolderPreFilledName = '';
        if (NewFolderIncludesList.length == 0) {
            NewFolderPreFilledName = 'Untitled folder';
        }
        if (NewFolderIncludesList.length == 1 && NewFolderIncludesList[0].name == 'Untitled folder') {
            NewFolderPreFilledName = 'Untitled folder 2';
        }
        if (NewFolderIncludesList.length == 1 && NewFolderIncludesList[0].name != 'Untitled folder') {
            NewFolderPreFilledName = 'Untitled folder';
        }
        if (NewFolderIncludesList.length >= 2) {
            let _NewFolderIncludesList = this.boxInfo!.moveToElementList.filter(x => {
                return x.name.startsWith('Untitled folder') &&
                    ((!isNaN(parseInt(x.name.replace('Untitled folder ', '')))));
            });
            let currentIndex = 0;
            let i = 2;
            let CurrentFolderName = 'Untitled folder';
            while (currentIndex != -1) {
                CurrentFolderName = 'Untitled folder ' + i.toString();
                currentIndex = _NewFolderIncludesList.findIndex(x => x.name == CurrentFolderName);
                i++;
            }
            let UntitledFolderIndex = NewFolderIncludesList.findIndex(x => x.name == 'Untitled folder');
            if (UntitledFolderIndex == -1) {
                NewFolderPreFilledName = 'Untitled folder';
            } else {
                NewFolderPreFilledName = 'Untitled folder ' + (i - 1).toString();
            }
        }
        return NewFolderPreFilledName;

         */
    }

    // when uer single click folder
    selectData(dataID: any) {
        this.selectedDataID = dataID;
    }

    // findout the folder is one of selected data or not
    confirmDuplicated(dataID: any): boolean {
        const index = this._toMoveDataIDs.indexOf(dataID);
        return index != -1;
    }

    // update the current data list status
    updateCurrentMoveToDataList() {
        const boxId = this.boxId;
        const currentMoveToRootID = this.currentMoveToRootID;
        if (this.currentMoveToRootID == 'root') {
            this.currentFolderName = this.boxInfo!.name;
        }
        this.store$.dispatch(updateCurrentMoveToDataList({ boxId, currentMoveToRootID }));
    }


    submitMoveToData() {
        const moveToElement: MoveToElement = {
            boxId: this.selectedBoxID,
            folderID: this.selectedDataID == '' ? this.currentMoveToRootID : this.selectedDataID,
        };
        this.submitMoveTo.emit(moveToElement);
    }

    closeModal() {
        this.matDialogRef.close();
    }

}
