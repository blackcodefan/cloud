import { SelectionModel } from '@angular/cdk/collections';
import { AfterContentInit, AfterViewInit, Component, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BusEventEnum, CheckBoxItem, Contact, ContactItemInformationCategory, ContactsService, DomService, EventBusService, Group, LoggingService } from 'core-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { catchError, combineLatest, distinctUntilChanged, filter, map, switchMap } from 'rxjs';
import { SubSink } from 'subsink';
import { ContactDefaultGroupEnum } from '../../model';
import { ContactSearchPipe } from '../../pipes/contact-search.pipe';
import {
    ContactsState,
    selectGroupList,
    selectSelectedContact,
    selectSelectedGroupId,
    selectSidebarStatus,
    selectSortDirection,
    selectSortKey,
    setDefaultGroupCount,
    setGroups,
    setSelectedContact,
} from '../../store';
import { Invite12coContactsComponent } from '../invite-to-12co-contacts/invite12co-contacts.component';
import { ContactsRightComponentComponent, PlaceholderContactsLayoutComponent } from '../layout';
import { NewContactComponent } from '../new-contact/new-contact.component';
import { NewGroupComponent } from '../new-group/new-group.component';

@Component({
    selector: 'app-contact-list',
    templateUrl: './contact-list.component.html',
    styleUrls: [ './contact-list.component.scss' ],
})
export class ContactListComponent implements OnInit, OnDestroy, AfterViewInit, AfterContentInit {
    @ViewChild('contactOptionMenu', { read: MatMenuTrigger, static: true }) contactOptionMenuTrigger: MatMenuTrigger;

    sortDirection: string;
    sortNameKey: string;
    sidebarStatus: boolean;
    dts_disabled: boolean;
    cdkDragStatus: boolean;
    selectedContactID: number;
    selectedContacts!: Array<Contact>;
    selectedContact: Contact;
    MouseClientX!: number;
    MouseClientY!: number;
    contacts: any[] = []; // Contact
    //set selected contact
    contextMenuPosition: any = { x: 0, y: 0 };
    ContactItemInformationCategory = ContactItemInformationCategory;
    selection = new SelectionModel<Contact>(true, []);
    isAllSelected: boolean = false;
    searchFormControl: UntypedFormControl = new UntypedFormControl({ value: null, disabled: false });
    searchStatus: boolean = false;
    contactSearchPipe = new ContactSearchPipe();
    loading = false;
    sortKey: string = 'LastName';
    contactsInGroup = { contacts: 0, inTwelveCo: 0 };
    private subSink = new SubSink();
    private selectedGroupId: number;
    private groups: Array<Group>;

    constructor(private store$: Store<ContactsState>, private renderer: Renderer2, private router: Router, private spinnerService: NgxSpinnerService,
                private domService: DomService, private matDialog: MatDialog, private matSnack: MatSnackBar, private contactService: ContactsService,
                private eventBus: EventBusService, private logger: LoggingService) {
        this.dts_disabled = false;
        this.cdkDragStatus = true;
        this.selectedContacts = new Array<Contact>();
        this.renderer.listen('window', 'mousemove', (event: any) => {
            this.MouseClientX = event.clientX;
            this.MouseClientY = event.clientY;
        });
    }

    @HostListener('document:contextmenu', [ '$event' ])
    discardRightClick(event: MouseEvent) {
        event.preventDefault();
    }

    ngOnInit(): void {
        this.domService.appendComponentToSidebar(PlaceholderContactsLayoutComponent);
        this.domService.appendComponentToRightSide(ContactsRightComponentComponent);
        this.subSink.sink = this.store$.pipe(select(selectSelectedContact)).subscribe(selectedContact => this.selectedContact = selectedContact);
        this.subSink.sink = this.store$.pipe(select(selectGroupList)).subscribe(s => this.groups = s);
        this.subSink.sink = this.store$.pipe(select(selectSelectedGroupId), distinctUntilChanged()).subscribe(groupId => {
            this.loadContactsForGroup(groupId);
            this.spinnerService.hide('contact-spinner');
        }, error => {
            console.error('error fetching contacts');
            this.matSnack.open('Error fetching contacts', 'error');
        });

        this.subSink.sink = combineLatest(
            this.store$.pipe(select(selectSortDirection), distinctUntilChanged()),
            this.store$.pipe(select(selectSortKey), distinctUntilChanged()),
        ).subscribe(([ sortDirection, sortKey ]) => {
            console.log(`sortDirection ${ sortDirection }`);
            this.sortDirection = sortDirection;
            this.sortNameKey = sortKey;
            this.contacts = this.contacts.sort(this.dynamicSort(this.sortNameKey, this.sortDirection));
            this.contactsInGroup.inTwelveCo = this.contacts.filter(c => c.in12CO).length;
            this.contactsInGroup.contacts = this.contacts.length - this.contactsInGroup.inTwelveCo;
        });


    }

    ngAfterViewInit() {
        this.subSink.sink = this.store$.pipe(select(selectSidebarStatus), distinctUntilChanged()).subscribe((selectSidebarStatus: boolean) => {
            this.sidebarStatus = selectSidebarStatus;
        });
        this.subSink.sink = this.eventBus.on(BusEventEnum.SHOW_SEARCH_BAR, () => this.showSearchBar());
        this.subSink.sink = this.searchFormControl.valueChanges.pipe(distinctUntilChanged(), filter(f => !!f)).subscribe(searchTerm => {
        });

    }

    ngAfterContentInit() {
    }

    dynamicSort(property: string, sortDirection: string = 'ascending') {
        console.log(`sorting ${ property } ${ sortDirection }`);
        let sortOrder = sortDirection === 'ascending' ? 1 : -1;
        return function (a: any, b: any) {
            let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        };
    }

    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }

    handleEditContact() {
        this.store$.dispatch(setSelectedContact({ selectedContact: this.selectedContacts[0] }));
        this.router.navigateByUrl('/contacts/edit-contact');
    }

    handleDeleteContact(contact: Contact) {
        console.log('deleting contact ', contact);
        this.contactService.deleteContact(contact).subscribe(res => {
            this.logger.info('Deleted  contact');
            this.logger.info('Deleted  contact');
            this.refreshGroupInfo();
            this.loadContactsForGroup(this.selectedGroupId);
        }, err => {
            this.logger.error('Error deleting contact: ', err?.err?.message);
            this.matSnack.open(`Error deleting ${ this.selectedContact.firstName } ${ this.selectedContact.lastName }: ${ err?.error?.message }`);
        });
    }

    handleBlockContact(contact: Contact) {
        if (this.selectedContacts && this.selectedContacts.length > 1) {
            console.info('blocked contacts: ', this.selectedContacts);
            this.subSink.sink = this.contactService.blockContacts(this.selectedContacts).subscribe(res => {
                this.logger.info('Blocked contact');
                this.refreshGroupInfo();
                this.loadContactsForGroup(this.selectedGroupId);
            }, (err) => {
                this.logger.error('Error blocking contact: ', err?.err?.message);
                this.matSnack.open(`Error blocking ${ this.selectedContact.firstName } ${ this.selectedContact.lastName }: ${ err?.error?.message }`);
            });
        } else {
            console.info('blocked contact: ', this.selectedContact);
            this.subSink.sink = this.contactService.block(contact).subscribe(res => {
                this.logger.info('Blocked contact');
                this.refreshGroupInfo();
                this.loadContactsForGroup(this.selectedGroupId);
            }, (err) => {
                this.logger.error('Error blocking contact: ', err?.err?.message);
                this.matSnack.open(`Error blocking ${ this.selectedContact.firstName } ${ this.selectedContact.lastName }: ${ err?.error?.message }`);
            });
        }

        // this.store$.dispatch(blockSelectedContact({ selectedContact: this.selectedContact }));
    }

    handleApps(appName: string) {
        switch (appName) {
            case 'circle-mail':
                this.router.navigateByUrl('/circle-mail');
                break;
            default:
                this.router.navigateByUrl('/databank');
        }
        console.log('handling ', appName);
    }

    invite12co_contact(contact: Contact) {
        const optEmails = contact.optionList.filter(c => c.category === ContactItemInformationCategory.EMAIL);
        if (optEmails.length > 0) {
            const emails = new Array<CheckBoxItem>();
            optEmails.forEach(o => {
                emails.push({
                    id: contact.id,
                    value: o.value,
                    checked: false,
                    name: ((contact.firstName === null ? '' : contact.firstName + ' ') + (contact.lastName === null ? '' : contact.lastName)),
                });
            });
            const dialog = this.matDialog.open(Invite12coContactsComponent);

            dialog.componentInstance.emails = emails;
            dialog.componentInstance.count_email = emails.length;
        } else {
            this.matSnack.open('This contact doesn\'t have a valid email address');
        }
    }


    refreshGroupInfo() {
        this.subSink.sink = this.contactService.listGroup().subscribe(groups => this.store$.dispatch(setGroups({ groups })));
        this.contactService.findDefaultContactsCount().subscribe((res) => {
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

    call(contactToCall: Contact) {
        if (contactToCall.in12CO) {

        } else {
            this.matSnack.open('This contacts is not in 12co. (i will put a nice modal to send an invite)');
        }
    }


    newContact() {
        console.log('new contact');
        this.matDialog.open(NewContactComponent, { panelClass: 'new-contact' });
    }

    newGroup() {
        console.log('new group');
        this.matDialog.open(NewGroupComponent, { panelClass: 'new-group' });
    }

    private showSearchBar() {
        console.log('in event');
        this.searchStatus = true;
    }

    private loadContactsForGroup(groupId: number) {
        // this.loader.showLoader();
        this.spinnerService.show('contact-spinner');
        if (groupId < 0) {
            switch (groupId) {
                case -2:
                    this.subSink.sink = this.contactService.listBlockedContacts()
                        .pipe(
                            switchMap(contacts => this.contactService.fetchContactMembership()
                                .pipe(map(membership => ({ contacts, membership }))),
                            ),
                            catchError(e => {
                                this.spinnerService.hide('contact-spinner');
                                return this.contacts;
                            }),
                        )
                        .subscribe(({ contacts, membership }) => {

                            this.contacts = contacts.map(c => {
                                if (membership && membership[c.id]) {
                                    return Object.assign({}, c, { in12CO: true });
                                }
                                this.spinnerService.hide('contact-spinner');
                                return c;
                            });
                            this.contactsInGroup.inTwelveCo = this.contacts.filter(c => c.in12CO).length;
                            this.contactsInGroup.contacts = this.contacts.length - this.contactsInGroup.inTwelveCo;
                        }, error => {
                            this.spinnerService.hide('contact-spinner');
                            this.contacts = [];
                            this.contactsInGroup.inTwelveCo = this.contacts.filter(c => c.in12CO).length;
                            this.contactsInGroup.contacts = this.contacts.length - this.contactsInGroup.inTwelveCo;
                            this.matSnack.open(`Error fetching contacts for group ${ error?.error?.message }`); // when translations available -> this.matSnack.open(`${this.translateService.instant('contacts.ERROR_FETCHING_GROUP_CONTACTS')} ${ error?.error?.message }`)
                        });
                    break;
                case -1:
                default:
                    this.subSink.sink = this.contactService.listAllContacts()
                        .pipe(
                            switchMap(contacts => this.contactService.fetchContactMembership()
                                .pipe(map(membership => ({ contacts, membership }))),
                            ),
                            catchError(e => {
                                this.spinnerService.hide('contact-spinner');
                                return this.contacts;
                            }),
                        )
                        .subscribe(({ contacts, membership }) => {
                            this.contacts = contacts.map(c => {
                                if (membership && membership[c.id]) {
                                    return Object.assign({}, c, { in12CO: true });
                                }
                                this.spinnerService.hide('contact-spinner');
                                return c;
                            });
                            this.contactsInGroup.inTwelveCo = this.contacts.filter(c => c.in12CO).length;
                            this.contactsInGroup.contacts = this.contacts.length - this.contactsInGroup.inTwelveCo;
                        }, error => {
                            this.spinnerService.hide('contact-spinner');
                            this.contacts = [];
                            this.contactsInGroup.inTwelveCo = this.contacts.filter(c => c.in12CO).length;
                            this.contactsInGroup.contacts = this.contacts.length - this.contactsInGroup.inTwelveCo;
                            this.matSnack.open(`Error fetching contacts for group ${ error?.error?.message }`); // when translations available -> this.matSnack.open(`${this.translateService.instant('contacts.ERROR_FETCHING_GROUP_CONTACTS')} ${ error?.error?.message }`)
                        });
                    break;
            }
        } else {
            this.subSink.sink = this.contactService.listContactFromGroup(groupId).subscribe(res => {
                this.contacts = res;
                this.contactsInGroup.inTwelveCo = this.contacts.filter(c => c.in12CO).length;
                this.contactsInGroup.contacts = this.contacts.length - this.contactsInGroup.inTwelveCo;
                // this.spinnerService.hide('contact-spinner');
                this.spinnerService.hide('contact-spinner');
            }, error => {
                // this.spinnerService.hide('contact-spinner');
                this.spinnerService.hide('contact-spinner');
                this.matSnack.open(`Error fetching contacts for group ${ error?.error?.message }`); // when translations available -> this.matSnack.open(`${this.translateService.instant('contacts.ERROR_FETCHING_GROUP_CONTACTS')} ${ error?.error?.message }`)
            });
        }
        this.contactsInGroup.inTwelveCo = this.contacts.filter(c => c.in12CO).length;
        this.contactsInGroup.contacts = this.contacts.length - this.contactsInGroup.inTwelveCo;
    }


}
