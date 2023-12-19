import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { ItemDetails } from 'core-lib';
import { SubSink } from 'subsink';
import { DatabankState, selectSelectedFolder } from '../../../store';

@Component({
    selector: 'app-databank-preview-folder',
    templateUrl: './databank-preview-folder.component.html',
    styleUrls: [ './databank-preview-folder.component.scss' ],
})
export class DatabankPreviewFolderComponent implements OnInit {
    selectedFolder: ItemDetails;
    private subSink = new SubSink();

    constructor(private store: Store<DatabankState>) {
    }

    ngOnInit(): void {
        this.subSink.sink = this.store.pipe(select(selectSelectedFolder)).subscribe((selectedFolder: ItemDetails) => {
            this.selectedFolder = selectedFolder;
        });
    }

}
