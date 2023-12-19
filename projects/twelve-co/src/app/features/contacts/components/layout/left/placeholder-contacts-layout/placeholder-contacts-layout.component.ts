import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { BusEvent, BusEventEnum, Contact, ContactsService, DomService, EventBusService, Group, LoaderService, User } from 'core-lib';
import { distinctUntilChanged, mergeMap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { ContactDefaultGroupEnum, GROUP_TYPE } from '../../../../model';
import { ContactImportService } from '../../../../services/contact-import.service';
import {
    ContactsState,
    selectDefaultGroupCount,
    selectGroupList,
    selectNewGroupStatus,
    selectSelectedGroupId,
    selectSelectedSubscriber,
    selectSidebarStatus,
    selectSortDirection,
    selectSortKey,
    setDefaultGroupCount,
    setSelectedGroupAction,
} from '../../../../store';
import { NewContactComponent } from '../../../new-contact/new-contact.component';
import { NewGroupComponent } from '../../../new-group/new-group.component';

@Component({
    selector: 'app-placeholder-contacts-layout',
    templateUrl: './placeholder-contacts-layout.component.html',
    styleUrls: [ './placeholder-contacts-layout.component.scss' ],
})
export class PlaceholderContactsLayoutComponent implements OnInit {
    sortDirection: string;
    sidebarStatus: boolean;
    groups: Array<Group>;
    selectedGroupId: number;
    isNewGroup: boolean;
    sortKey: string;
    myContactsCount: number = 0;
    blockedContactsCount: number = 0;
    readonly GROUP_TYPE = GROUP_TYPE;
    private subscriber: User;
    private subSink = new SubSink();
    private fileInput: any;

    constructor(public router: Router, private store$: Store<ContactsState>, private matDialog: MatDialog, private loader: LoaderService, private matSnack: MatSnackBar,
                private translate: TranslateService, private eventBus: EventBusService, private contactsService: ContactsService,
                private domService: DomService, private importService: ContactImportService) {
    }

    ngOnInit(): void {
        this.subSink.sink = this.store$.pipe(select(selectSortKey), distinctUntilChanged()).subscribe((sortKey: string) => {
            this.sortKey = sortKey;
        });
        this.subSink.sink = this.store$.pipe(select(selectSortDirection), distinctUntilChanged()).subscribe((sortDirection: string) => {
            this.sortDirection = sortDirection;
        });
        this.subSink.sink = this.store$.pipe(select(selectSidebarStatus), distinctUntilChanged()).subscribe((selectSidebarStatus: boolean) => {
            this.sidebarStatus = selectSidebarStatus;
        });
        this.store$.pipe(select(selectSelectedSubscriber)).subscribe(s => this.subscriber = s);
        this.store$.pipe(select(selectSortKey)).subscribe(sortKey => this.sortKey = sortKey);

        this.store$.pipe(select(selectNewGroupStatus)).subscribe((newGroupStatus: boolean) => {
            this.isNewGroup = newGroupStatus;
        });
        this.store$.pipe(select(selectSelectedGroupId)).subscribe((selectedGroupId: number) => {
            this.selectedGroupId = selectedGroupId;
        });


        this.store$.pipe(select(selectGroupList)).subscribe((groupList) => {
            this.groups = groupList;
        });
        this.store$.pipe(select(selectDefaultGroupCount)).subscribe((defaultGroupCount) => {
            this.myContactsCount = defaultGroupCount[ContactDefaultGroupEnum.MY_CONTACTS];
            this.blockedContactsCount = defaultGroupCount[ContactDefaultGroupEnum.BLOCKED];
        });
        this.subSink.sink = this.contactsService.findDefaultContactsCount().subscribe((res) => {
            let defaultGroupCount = { [ContactDefaultGroupEnum.MY_CONTACTS]: 0, [ContactDefaultGroupEnum.BLOCKED]: 0 };
            res.forEach(r => {
                if (r.groupId == -1) {
                    defaultGroupCount[ContactDefaultGroupEnum.MY_CONTACTS] = r.count;
                }
                if (r.groupId == -2) {
                    defaultGroupCount[ContactDefaultGroupEnum.BLOCKED] = r.count;
                }
            });
            this.store$.dispatch(setDefaultGroupCount({ defaultGroupCount }));

        });
        this.fileInput = document.createElement('input') as HTMLInputElement;
        this.fileInput.type = 'file';
        this.fileInput.accept = '.csv,.vcard';
        this.fileInput.excludeAcceptAllOption = true;
        this.fileInput.label = 'contact files';
        this.fileInput.addEventListener('change', this.importContacts, false);
        this.store$.pipe(select(selectSidebarStatus)).subscribe(status => this.sidebarStatus = status);
    }

    handleCreateNewContact() {
        this.matDialog.open(NewContactComponent);
    }
    handleCreateNewGroup() {
        this.matDialog.open(NewGroupComponent);
    }

    setCurrentGroup(group: any) {
        this.store$.dispatch(setSelectedGroupAction({ groupId: group.id }));
    }


    handleImportContacts() {
        this.fileInput.click();
    }

    importContacts = (): void => {
        const files = this.fileInput.files?.[0];
        if (!files) {
            return;
        }
        this.loader.showLoader();
        this.importService.loadContactsFromFile(files)
            .pipe(
                mergeMap(res => this.importService.loadContactsFromFile(files)),
                mergeMap((contacts: Array<Contact>) => this.contactsService.saveContacts(contacts)),
            )
            .subscribe((importResult: Array<Contact>) => {
                this.loader.hideLoader();
                this.matSnack.open(this.translate.instant('contacts.IMPORTED', { count: importResult?.length || 0 }));
                this.eventBus.emit(new BusEvent(BusEventEnum.REFRESH_CONTACTS, true));
            }, (error: any) => {
                this.loader.hideLoader();
                this.matSnack.open(this.translate.instant('contacts.IMPORTED_ERROR', { count: 0 }));
            });
    };
}
