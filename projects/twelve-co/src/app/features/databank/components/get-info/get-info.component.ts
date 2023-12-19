import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { AccountSummary, ItemDetails, ItemTypeEnum, StoragesMinDto, VersionInfoDto } from 'core-lib';
import { FileSaverService } from 'ngx-filesaver';
import { SubSink } from 'subsink';
import { DatabankService } from '../../services';
import { DatabankState, selectSelectedAccount, selectSelectedStorage } from '../../store';

@Component({
    selector: 'app-get-info',
    templateUrl: './get-info.component.html',
    styleUrls: [ './get-info.component.scss' ],
})
export class GetInfoComponent implements OnInit, OnDestroy {
    dataInfo: ItemDetails;
    @Input() dataType!: string;
    description: string;
    readonly ItemTypeEnum = ItemTypeEnum;
    subSink = new SubSink();
    contextPosition = { x: '', y: '' };
    @ViewChild('VersionHandleTrigger', { read: MatMenuTrigger, static: false }) VersionHandleTrigger!: MatMenuTrigger;
    selectedStorage: ItemDetails;
    versions: Array<VersionInfoDto>;
    maxVersion: number;
    private selectedVersion: VersionInfoDto;
    private selectedAccount: AccountSummary;

    constructor(public _dialogRef: MatDialogRef<GetInfoComponent>, private store: Store<DatabankState>, private databankService: DatabankService, private fileSaverService: FileSaverService,
                private matSnack: MatSnackBar) {
    }

    ngOnInit(): void {
        this.subSink.sink = this.store.pipe(select(selectSelectedStorage)).subscribe((selectedStorage: ItemDetails) => {
            console.log(selectedStorage);
            this.selectedStorage = selectedStorage;
            this.dataType = 'data';
            this.fetchVersion();
        });
        this.subSink.sink = this.store.pipe(select(selectSelectedAccount)).subscribe(acc => this.selectedAccount = acc);
    }

    private fetchVersion() {
        this.subSink.sink = this.databankService.getVersions(this.selectedStorage.itemId).subscribe((versions) => {
            this.versions = versions;
            this.maxVersion = Math.max(...versions.map(v => v.versionNumber));
        });
    }

    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }

    // show folders and files right setting menu
    showVersionHandleMenu(evt: MouseEvent, version: VersionInfoDto) {
        evt.preventDefault();
        console.log(this.VersionHandleTrigger.menuOpen);
        if (this.VersionHandleTrigger.menuOpen) {
            this.VersionHandleTrigger.closeMenu();
        }
        this.contextPosition.x = evt.clientX + 'px';
        this.contextPosition.y = evt.clientY + 'px';
        this.selectedVersion = version;
        setTimeout((x: any) => {
            this.VersionHandleTrigger.openMenu();
            this.VersionHandleTrigger.menu.focusFirstItem('mouse');
        }, 300);
    }

    downloadFile() {
        this.databankService.downloadStorage(this.selectedVersion.id).subscribe(res => {
            this.fileSaverService.save(res, this.selectedStorage.name);
        });
    }

    removeVersion() {
        let strge = Object.assign({}, { ...this.selectedStorage }, { itemId: this.selectedVersion.id });
        // @ts-ignore
        let dd: StoragesMinDto = { accountId: this.selectedAccount?.id, storages: [ strge ] };
        this.databankService.deleteItems(dd).subscribe(res => {
            this.fetchVersion();
        }, error => {
            this.matSnack.open('Error deleting version');
        });
    }
}
