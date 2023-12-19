import { Component, OnInit } from '@angular/core';
import { DomService } from 'core-lib';
import { HeaderComponent } from './components/header/header.component';

@Component({
    selector: 'app-alo-home',
    templateUrl: './alo-home.component.html',
    styleUrls: [ './alo-home.component.scss' ],
})
export class AloHomeComponent implements OnInit {

    constructor(private domService: DomService) {
    }

    ngOnInit(): void {
        this.domService.appendComponentToHeader(HeaderComponent, 'alo-header');
    }

}
