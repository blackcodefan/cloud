import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { LoggingService } from 'core-lib';
import { SubSink } from 'subsink';
import { BreadCrumbElement } from '../models';
import { clearBoxNavigationTree, clearSelection, DatabankState, selectBreadcrumbs, setBreadCrumbList } from '../store';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService implements OnDestroy {
  private subSink = new SubSink();
  private breadCrumbList: Array<BreadCrumbElement>;

  constructor(private store: Store<DatabankState>, private router: Router, private logger: LoggingService) {
    this.subSink.sink = this.store.pipe(select(selectBreadcrumbs)).subscribe(res => this.breadCrumbList = res);
  }

  addBreadcrumb(breadCrumbItem: BreadCrumbElement) {
    console.log('breadcrumb list', this.breadCrumbList);
    if (this.breadCrumbList.length > 0 && breadCrumbItem.itemId !== this.breadCrumbList[this.breadCrumbList.length - 1].itemId) {
      const breadCrumbList = [ ...this.breadCrumbList, breadCrumbItem ];
      this.store.dispatch(setBreadCrumbList({ breadCrumbList }));
    } else {
      this.store.dispatch(setBreadCrumbList({ breadCrumbList: [ breadCrumbItem ] }));
    }
  }


  navigateToBreadcrumb(breadCrumbItem: BreadCrumbElement) {
      this.router.navigateByUrl(`/apps/databank/box/folders/${breadCrumbItem.itemId}`);
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }


}
