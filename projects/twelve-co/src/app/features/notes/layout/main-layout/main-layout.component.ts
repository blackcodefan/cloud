import { Component, OnInit } from '@angular/core';
import { BusEvent, BusEventEnum, EventBusService } from 'core-lib';

@Component({
    selector: 'app-main-layout',
    templateUrl: './main-layout.component.html',
    styleUrls: [ './main-layout.component.scss' ],
})
export class MainLayoutComponent implements OnInit {

    constructor(private busEventService: EventBusService) {
    }

    ngOnInit(): void {
    }

    handleCreateNewNote() {
        this.busEventService.emit(new BusEvent(BusEventEnum.NEW_NOTE));
    }
}
