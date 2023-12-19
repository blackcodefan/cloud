import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Activity, DomService, ItemDetails } from 'core-lib';
import { SubSink } from 'subsink';
import { ActivityService } from '../../services';
import { DatabankState, retriveSingleBox } from '../../store';

@Component({
    selector: 'app-activity-list',
    templateUrl: './activity-list.component.html',
    styleUrls: [ './activity-list.component.scss' ],
})
export class ActivityListComponent implements OnInit, OnDestroy {

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    boxId!: string;
    boxInfo!: ItemDetails;
    dataSource: any;
    displayedColumns: string[] = [ 'timestamp', 'activityTypeEnum', 'activityUser', 'metadataDto' ];
    activityData: Array<Activity> = [];
    private subSink = new SubSink();

    constructor(private route: ActivatedRoute, private router: Router, private store$: Store<DatabankState>, private domService: DomService, private activityService: ActivityService) {
    }

    ngOnInit(): void {
        this.subSink.sink = this.route.params.subscribe(params => {
            this.boxId = params.boxId;
            this.store$.pipe(select(retriveSingleBox(this.boxId))).subscribe((x: any) => {
                if (x == undefined) {
                    this.router.navigateByUrl('/apps/databank');
                } else {
                    this.boxInfo = x;
                    this.subSink.sink = this.activityService.getActivityForBox(this.boxId).subscribe((activities: Activity[]) => {
                        this.activityData = activities;

                        this.dataSource = new MatTableDataSource(this.activityData);
                        this.dataSource.sort = this.sort;
                    });

                }
            });
        });
    }


    ngOnDestroy(): void {
        this.domService.clearComponentSidebar();
        this.subSink.unsubscribe();
    }

}
