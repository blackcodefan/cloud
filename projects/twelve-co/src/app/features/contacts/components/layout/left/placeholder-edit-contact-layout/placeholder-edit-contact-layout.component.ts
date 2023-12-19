import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BusEvent, BusEventEnum, EventBusService } from 'core-lib';
import { ContactsState } from '../../../../store';

@Component({
  selector: 'app-placeholder-new-contact-layout',
  templateUrl: './placeholder-edit-contact-layout.component.html',
  styleUrls: [ './placeholder-edit-contact-layout.component.scss' ],
})
export class PlaceholderEditContactLayoutComponent implements OnInit {

  constructor(private router: Router, private store: Store<ContactsState>, private eventBus: EventBusService) {
  }

  ngOnInit(): void {
  }

  goContactList(status: boolean) {
    console.log('clicked cc');
    this.eventBus.emit(new BusEvent(BusEventEnum.EDITING_CONTACT, status));
  }

}
