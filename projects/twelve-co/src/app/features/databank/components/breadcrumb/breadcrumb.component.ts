import { Component, Input, OnInit } from '@angular/core';
import { BreadCrumbElement, Taxonomy } from '../../models';
import { BreadcrumbService } from '../../services';

@Component({
    selector: 'app-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: [ './breadcrumb.component.scss' ],
})
export class BreadcrumbComponent implements OnInit {

    @Input()
    breadCrumbList: Array<BreadCrumbElement>;

    @Input()
    actionBarEllipsis: boolean;

    @Input()
    breadCrumbObj: Taxonomy;

    @Input()
    currentFolderName: string;

    constructor(private breadCrumbService: BreadcrumbService) {
    }

    ngOnInit(): void {
    }

    navigateToFolderFromPath(breadCrumb: BreadCrumbElement, index: number) {
        this.breadCrumbService.navigateToBreadcrumb(breadCrumb);
    }
}
