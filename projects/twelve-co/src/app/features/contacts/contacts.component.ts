import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { BusEvent, BusEventEnum, Contact, ContactsService, DomService, EventBusService, Group, LoaderService, LoggingService } from 'core-lib';
import { SubSink } from 'subsink';
import { SidebarContactsLayoutComponent } from './components/layout/left/sidebar-contacts-layout/sidebar-contacts-layout.component';
import { ItemTypes } from './model';
import { ContactsState, selectSelectedContact, setGroups } from './store';

@Component({
    selector: 'app-contacts',
    templateUrl: './contacts.component.html',
    styleUrls: [ './contacts.component.scss' ],
})
export class ContactsComponent implements OnInit, OnDestroy {
    subSink = new SubSink();
    public item: any;
    public itemTypes = ItemTypes;
    public editMode = false;
    public imported = false;
    selectedContact: Contact;


    constructor(private contactsService: ContactsService, private store: Store<ContactsState>, private loader: LoaderService,
                private eventBus: EventBusService, private logger: LoggingService, private domService: DomService) {
    }

    ngOnInit(): void {
        this.domService.appendComponentToSidebar(SidebarContactsLayoutComponent);
        this.loader.showLoader();
        this.subSink.sink = this.contactsService.listGroup().subscribe((groups: Array<Group>) => {
            this.store.dispatch(setGroups({ groups }));
            this.loader.hideLoader();
        }, error => {
            this.store.dispatch(setGroups({ groups: new Array<Group>() }));
            this.loader.hideLoader();
        });
        this.subSink.sink = this.store.pipe(select(selectSelectedContact)).subscribe((selectedContact: Contact) => this.selectedContact = selectedContact);

        this.subSink.sink = this.eventBus.on(BusEventEnum.EDITING_CONTACT, (editing) => {
            this.logger.info('Editing contact event received: ', editing);
            this.editMode = editing;
        });

        this.subSink.sink = this.eventBus.on(BusEventEnum.DELETE_CONTACT, (deleted) => {
            this.logger.info('Delete contact event received', deleted);
            this.handleDeleteContact();
        });

    }

    ngOnDestroy(): void {
        this.subSink.unsubscribe();
        this.domService.clearComponentSidebar();
    }

    handleDeleteContact() {
        if (this.selectedContact !== null) {
            this.loader.showLoader();
            this.subSink.sink = this.contactsService.deleteContact(this.selectedContact).subscribe(_ => {
                // @ts-ignore
                this.store.dispatch(setSelectedContactAction({ contact: null }));
                this.eventBus.emit(new BusEvent(BusEventEnum.REFRESH_CONTACTS, true));
                this.loader.hideLoader();
            }, (error: any) => {
                this.logger.error('error deleting contact: ', error);
                this.loader.hideLoader();
            });
        }
    }
}
