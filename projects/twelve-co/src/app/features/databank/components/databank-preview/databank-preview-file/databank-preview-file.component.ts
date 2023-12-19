import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { ItemDetails } from 'core-lib';
import { SubSink } from 'subsink';
import { DatabankState, selectSelectedFile } from '../../../store';

@Component({
    selector: 'app-databank-preview-file',
    templateUrl: './databank-preview-file.component.html',
    styleUrls: [ './databank-preview-file.component.scss' ],
})
export class DatabankPreviewFileComponent implements OnInit, OnDestroy {
    selectedFile: ItemDetails;
    private subSink = new SubSink();

    constructor(private store: Store<DatabankState>) {
    }

    ngOnInit(): void {
        this.subSink.sink = this.store.pipe(select(selectSelectedFile)).subscribe((selectedFile: ItemDetails) => {
            this.selectedFile = selectedFile;
        });
    }


    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }

}
