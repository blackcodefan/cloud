import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-search-contacts',
  templateUrl: './search-contacts.component.html',
  styleUrls: ['./search-contacts.component.scss']
})
export class SearchContactsComponent implements OnInit {
  searchKey: string;
  @ViewChild('input') inputElement: ElementRef;

  constructor(
    private matDialog: MatDialogRef<SearchContactsComponent>
  ) {
    this.searchKey = '';
  }

  ngOnInit(): void {
    let backDropElement = document.getElementsByClassName('cdk-overlay-dark-backdrop')[0] as HTMLElement;
    backDropElement!.style.background = "transparent";
  }

  setSearchKey(evt: any) {
    this.searchKey = evt.target.value;
  }

  searchContacts() {
    this.searchKey = '';
    this.inputElement.nativeElement.select();
    this.inputElement.nativeElement.focus();
  }

  close_Modal() {
    this.matDialog.close();
  }

}
