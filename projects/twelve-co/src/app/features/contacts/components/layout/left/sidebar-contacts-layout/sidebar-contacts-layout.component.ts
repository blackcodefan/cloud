import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, EventEmitter, HostListener, OnDestroy, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Contact, ContactsService, Group, User } from 'core-lib';
import { SubSink } from 'subsink';
import { ContactDefaultGroupEnum, GROUP_TYPE } from '../../../../model';
import {
  changeNewGroupStatus,
  ContactsState,
  selectDefaultGroupCount,
  selectGroupList,
  selectNewGroupStatus,
  selectSelectedGroupId,
  selectSelectedSubscriber,
  selectSortKey,
  setDefaultGroupCount,
  setGroups,
  setSelectedGroupAction,
} from '../../../../store';
import { Search12coContactsComponent } from '../../../search-12co-contacts/search12co-contacts.component';

@Component({
  selector: 'app-sidebar-contacts-layout',
  templateUrl: './sidebar-contacts-layout.component.html',
  styleUrls: [ './sidebar-contacts-layout.component.scss' ],
})

export class SidebarContactsLayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() changeSideBarStatus = new EventEmitter<boolean>();
  @ViewChildren('groupOptionMenu') groupOptionTriggerList: QueryList<MatMenuTrigger>;
  menuOpts = [ 'deleteGroupButton', 'renameGroupButton' ];
  sidebarStatus: boolean;
  renameText = '';
  groups: Array<Group>;
  isNewGroup: boolean;
  isNewContact: boolean;
  newGroupName: string;
  sortDir: string = 'ascending';
  sortKey: string;
  contextMenuPosition: any = { x: '', y: '' };
  myContactsCount: number = 0;
  blockedContactsCount: number = 0;
  //@ts-ignore
  editingGroupId: number = null;
  renamingGroup: boolean = false;
  readonly GROUP_TYPE = GROUP_TYPE;
  private groupOptionMenuTrigger: MatMenuTrigger;
  private subscriber: User;
  private subSink = new SubSink();
  selectedGroupId: number;
  private currentGroupName: string;

  constructor(private store$: Store<ContactsState>, private matDialog: MatDialog, public router: Router, private contactsService: ContactsService, private matSnack: MatSnackBar) {
    this.sidebarStatus = false;
    this.isNewContact = false;
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();

  }

  @HostListener('document:click', [ '$event' ]) onClickListener($event: any) {
    const element = this.groupOptionTriggerList.first;
    if (element.menuOpen || !this.renamingGroup) {
      this.groupOptionTriggerList.forEach(c => c?.closeMenu());
    }
    let target = $event.target as HTMLElement;

    if ((this.editingGroupId || this.renamingGroup) && this.menuOpts.indexOf(target.id) === -1 && target.id !== 'rename-group-input') {
      this.renameGroup();
    }
  }

  ngOnInit(): void {
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

  }

  cancelNewContact() {
    this.router.navigateByUrl('/contacts/list');
  }


  search_12contacts() {
    const dialog = this.matDialog.open(Search12coContactsComponent, { panelClass: 'search-12co-contacts-popup' });
    dialog.updatePosition({ top: '16px', left: '60px' });
  }

  setCurrentGroup(group: any) {
    this.store$.dispatch(setSelectedGroupAction({ groupId: group.id }));
  }

  cancelNewGroup() {
    this.newGroupName = '';
  }

  saveNewGroup() {
    let newName = this.newGroupName.trim();
    if (newName.length < 1) {
      this.matSnack.open('Group name cannot be empty');
      return;
    }
    const newGroup: Group = {
        id: -10,
        name: this.newGroupName,
        subscriberId: this.subscriber.id,
      }
    ;
    this.store$.dispatch(changeNewGroupStatus({ newGroupStatus: false }));
    this.subSink.sink = this.contactsService.createGroup(newGroup).subscribe(res => {
      this.subSink.sink = this.contactsService.listGroup().subscribe(groups => this.store$.dispatch(setGroups({ groups })),
        err => {
          console.error('error renaming group');
          this.matSnack.open('Error fetching groups', 'error');
        });
    }, error => {
      this.newGroupName = '';
      this.matSnack.open(`Error renaming  group ${ this.newGroupName }`, 'error');
    });
  }

  handleGroupRightClick(event: MouseEvent, newGroup: any) {
    this.store$.dispatch(setSelectedGroupAction({ groupId: newGroup.id }));

    this.currentGroupName = newGroup.name;
    this.contextMenuPosition.x = `${ event.x }px`;
    this.contextMenuPosition.y = `${ event.y }px`;
    console.log('querylist', this.groupOptionTriggerList);
    this.groupOptionTriggerList.first?.openMenu();
  }

  handleRenameGroup() {
    this.renamingGroup = true;
    this.editingGroupId = this.selectedGroupId;
    this.renameText = this.currentGroupName;
    setTimeout(() => {
      const inputElement = document.getElementById('rename-group-input') as HTMLInputElement;
      inputElement.focus();
      inputElement.select();
    }, 450);
  }

  handleDeleteGroup() {
    // this.groups = this.groups.filter(g => g.id !== this.currentGroup.id);
    this.subSink.sink = this.contactsService.deleteGroup(this.selectedGroupId).subscribe(res => {
      this.subSink.sink = this.contactsService.listGroup().subscribe(groups => {
        this.store$.dispatch(setGroups({ groups }));
        this.store$.dispatch(setSelectedGroupAction({ groupId: -1 })); // sets by default my contacts
      });
    }, err => {
      this.matSnack.open(`Error deleting group ${ err?.error.message }`, 'close');
    });

  }

  ngAfterViewInit(): void {
    this.groupOptionTriggerList.changes.subscribe((ch: QueryList<MatMenuTrigger>) => {
      this.groupOptionMenuTrigger = ch.first;
    });
  }

  renameGroup() {
    this.renamingGroup = false;
    //@ts-ignore
    this.editingGroupId = null;
    //@ts-ignore
    this.subSink.sink = this.contactsService.renameGroup({ id: this.selectedGroupId, name: this.renameText }).subscribe(res => {
      this.subSink.sink = this.contactsService.listGroup().subscribe(groups => this.store$.dispatch(setGroups({ groups })));
    }, err => {
      this.matSnack.open(`Error renaming group ${ err?.error.message }`, 'close');
    });
    this.renameText = '';
  }

  drop($event: CdkDragDrop<Array<Contact>, any>) {
    console.log('dropped elment');
    console.log($event);
  }


}
