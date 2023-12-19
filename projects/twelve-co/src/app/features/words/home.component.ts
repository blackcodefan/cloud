import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomService } from 'core-lib';
import { SubSink } from 'subsink';
import { WordsLeftSidebarComponent } from './layout';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: [ './home.component.scss' ],
})
export class HomeComponent implements OnInit, OnDestroy {
    private subSink = new SubSink();

    constructor(private domService: DomService) {
    }

    ngOnInit(): void {
        this.domService.appendComponentToSidebar(WordsLeftSidebarComponent);
    }

    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }

}
