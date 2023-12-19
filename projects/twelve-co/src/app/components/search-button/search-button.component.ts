import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-search-button',
  templateUrl: './search-button.component.html',
  styleUrls: ['./search-button.component.scss']
})
export class SearchButtonComponent implements OnInit {
  @Input() placeholder:string;
  public placeholders: any;
  isSearch: boolean = false;
  constructor() {
    this.placeholders = '';
  }

  ngOnInit(): void {
  }

  setSearchStatus(b: boolean) {
    this.isSearch = b;
    if(this.isSearch){
      setTimeout(() => {
        this.placeholders = this.placeholder;
      }, 100)
    }else{
      this.placeholders = '';
    }
  }

}
