import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomService, EventBusService } from 'core-lib';
import { SubSink } from 'subsink';
import { ExcelLeftComponent } from './layout/left/excel-left/excel-left.component';
import { ExcelService } from './services/excel.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: [ './home.component.scss' ],
})
export class HomeComponent implements OnInit, OnDestroy {
    private subSink = new SubSink();

    constructor(private eventBusService: EventBusService, private domService: DomService, private excelService: ExcelService) {
    }

    ngOnInit(): void {
        this.domService.appendComponentToSidebar(ExcelLeftComponent);
    }

    ngOnDestroy() {
        this.subSink.unsubscribe();
    }

}
