import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { DomService, ItemDetails } from 'core-lib';
import { SubSink } from 'subsink';
import { FilterBoxKeyEnum } from './models';
import { DatabankService } from './services';
import { DatabankState, selectBoxIsPreview, selectCurrentPreviewType, selectSelectedStorage, setBoxList, setIsBoxPreview } from './store';
import {NgxSpinnerService} from "ngx-spinner";

@Component({
    selector: 'app-databank',
    templateUrl: './databank.component.html',
    styleUrls: [ './databank.component.scss' ],
})
export class DatabankComponent implements OnInit, OnDestroy, AfterViewInit {
    selectedApp: any;
    loading: boolean = false;
    isBoxPreview: boolean = false;
    currentPreviewType: string;
    selectedStorage: ItemDetails;
    private subSink = new SubSink();
    private filterBoxKey: FilterBoxKeyEnum;

    constructor(private domService: DomService,
                private store: Store<DatabankState>,
                private spinner: NgxSpinnerService,
                private databankService: DatabankService) {
    }

    ngOnInit(): void {
        this.subSink.sink = this.databankService.fetchAllBoxes().subscribe(boxes => {
            this.store.dispatch(setBoxList({ boxsList: boxes }));
        });
        this.subSink.sink = this.store.pipe(select(selectBoxIsPreview)).subscribe((boxPreview: boolean) => this.isBoxPreview = boxPreview);
        this.subSink.sink = this.store.pipe(select(selectCurrentPreviewType)).subscribe((previewType: string) => this.currentPreviewType = previewType);
        this.subSink.sink = this.store.pipe(select(selectSelectedStorage)).subscribe(res => this.selectedStorage = res);
    }

    ngOnDestroy() {
        this.domService.clearComponentSidebar();
        this.domService.setIsLoading(false);
        // this.domService.clearComponentBody();
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.loading = true;
            this.domService.setIsLoading(true);
        }, 1000);
    }

    setIsPreview(isPreview: boolean) {
        this.store.dispatch(setIsBoxPreview({ isPreview }));
    }

    counter(size: number) {
        return new Array(size);
    }
}
