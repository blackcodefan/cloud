import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { AccountSummary, BusEventEnum, DomService, EventBusService, ItemDetails, LoaderService, Membership } from 'core-lib';
import { SubSink } from 'subsink';
import { DatabankService } from '../../services';
import { MembersService } from '../../services/members.service';
import { DatabankState, selectSelectedAccount, selectSelectedBox } from '../../store';
import { ChangePermissionComponent, MemberhsipRevokeComponent } from '../dialogs';

@Component({
    selector: 'app-members',
    templateUrl: './members.component.html',
    styleUrls: [ './members.component.scss' ],
})
export class MembersComponent implements OnInit {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    dataSource: any;
    members: Array<Membership> = [];
    displayedColumns: string[] = [ 'avatar', 'member', 'startDate', 'status', 'permission', 'actions' ];
    selectedBox: ItemDetails;
    private selectedAccount: AccountSummary;
    private folderId: string;
    private subSink = new SubSink();

    constructor(private databankService: DatabankService, private domService: DomService, private route: ActivatedRoute, private membersService: MembersService,
                private store: Store<DatabankState>, private loader: LoaderService, private dialog: MatDialog, private eventBus: EventBusService) {
    }

    ngOnInit(): void {
        this.subSink.sink = this.store.pipe(select(selectSelectedBox)).subscribe(selectedBox => this.selectedBox = selectedBox);
        this.subSink.sink = this.eventBus.on(BusEventEnum.REFRESH_MEMBERS, _ => this.fetchAndPopulateMemberDate(this.selectedBox.itemId));
        this.route.params.subscribe((routeParams) => {
            this.store.pipe(select(selectSelectedAccount)).subscribe(selectedAccount => {
                this.selectedAccount = selectedAccount;
                this.fetchAndPopulateMemberDate(routeParams.boxId);
            });
            this.folderId = routeParams.boxId;
            this.subSink.sink = this.eventBus.on(BusEventEnum.REMOVE_MEMBERSHIP, (membershipId) => {
                this.members = this.members.filter(m => m.id !== membershipId);
                this.dataSource = new MatTableDataSource(this.members);
            });
        });
    }

    handleChangePersmission(data: any) {
        console.log(data);
        this.dialog.open(ChangePermissionComponent, { width: '400px', data: { selectedMember: data } });
    }

    handleAddExpiration(data: any) {


    }

    handleRevokeMembership(data: any) {
        console.log(data);
        this.dialog.open(MemberhsipRevokeComponent, { width: '400px', height: '260px', data: { selectedMember: data } });
    }

    handleUninvite(data: any) {
        this.membersService.uninvite(data, this.selectedBox.itemId).subscribe(res => {

        }, (error) => {
            console.error('error uninviting ', data.member, '\n', error);
        });
    }

    private fetchAndPopulateMemberDate(boxId: string) {
        this.loader.showLoader();
        this.membersService.getMembersForStorageId(boxId).subscribe(res => {
            this.dataSource = new MatTableDataSource(res);
            this.loader.hideLoader();
            this.members = res;
        }, error => {
            this.loader.hideLoader();
            this.dataSource = new MatTableDataSource([]);
        });
    }
}
