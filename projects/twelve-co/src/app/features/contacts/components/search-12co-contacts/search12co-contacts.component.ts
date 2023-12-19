import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Contact, ContactsService } from 'core-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { debounceTime } from 'rxjs/operators';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-search12co-contacts',
  templateUrl: './search12co-contacts.component.html',
  styleUrls: [ './search12co-contacts.component.scss' ],
})
export class Search12coContactsComponent implements OnInit, OnDestroy {
  searchResult = new Array<Contact>();
  searchInTwelveCoFormControl = new UntypedFormControl();
  _isFound: boolean;
  spinnerStatus: boolean;
  @ViewChild('input') inputElement: ElementRef;
  searchContactsSpinner: string = 'searchContactSpinner';
  private subSink = new SubSink();

  constructor(private spinner: NgxSpinnerService, private contactService: ContactsService) {
  }

  ngOnDestroy(): void {

    this.subSink.unsubscribe();
  }

  ngOnInit(): void {
    this._isFound = false;
    this.subSink.sink = this.searchInTwelveCoFormControl.valueChanges.pipe(debounceTime(500)).subscribe((searchTerm => {
      this.spinner.show(this.searchContactsSpinner);
      this.subSink.sink = this.contactService.searchContactRegistered(searchTerm).subscribe(contacts => {
        this.spinner.hide(this.searchContactsSpinner);
        this.searchResult = contacts;
      }, err => {
        this.spinner.hide(this.searchContactsSpinner);
      });
    }));
    this.spinnerStatus = false;

    let backDropElement = document.getElementsByClassName('cdk-overlay-dark-backdrop')[0] as HTMLElement;
    backDropElement!.style.background = 'transparent';
  }

  showSpinner() {
    this.spinner.show(this.searchContactsSpinner);
    this.spinnerStatus = true;
    setTimeout(() => {
      this.spinner.hide(this.searchContactsSpinner);
      this.spinnerStatus = false;
    }, 2000);
  }

  remove_12CoContactSearchValue() {
    this.searchInTwelveCoFormControl.setValue('');
    this.inputElement.nativeElement.select();
    this.inputElement.nativeElement.focus();
  }

  addToMyContacts(contact: Contact) {
    console.error('will implement');
    // const selectedContact = this.searchResult.find(x => x.id == userID);
    // selectedContact!.status = true;
  }

}
