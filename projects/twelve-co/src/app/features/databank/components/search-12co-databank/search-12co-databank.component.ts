import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { AccountSummary, Search12CoItem, SearchService } from 'core-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, filter } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { DatabankState, selectSelectedAccount } from '../../store';

@Component({
    selector: 'app-search-12co-databank',
    templateUrl: './search-12co-databank.component.html',
    styleUrls: [ './search-12co-databank.component.scss' ],
})
export class Search12coDatabankComponent implements OnInit, OnDestroy {
    searchResult = new Array<Search12CoItem>();
    searchFormControl = new UntypedFormControl();
    found: boolean;
    spinnerStatus: boolean;
    @ViewChild('input') inputElement: ElementRef;
    private subSink = new SubSink();
    private selectedAccount: AccountSummary;

    constructor(private spinner: NgxSpinnerService, private searchService: SearchService, private router: Router, private store: Store<DatabankState>) {
        this.found = false;

    }

    ngOnInit(): void {
        this.subSink.sink = this.store.pipe(select(selectSelectedAccount)).subscribe(s => this.selectedAccount = s);
        this.subSink.sink = this.searchFormControl.valueChanges.pipe(
            debounceTime(300),
            filter(st => st && st.length >= 3),
        ).subscribe((keyword => {
            this.spinnerStatus = true;
            this.spinner.show('contactSearchSpinner');
            this.subSink.sink = this.searchService.searchAllStorages(keyword).subscribe(res => {
                if (res.length == 0) {
                    this.found = false;
                }
                this.searchResult = res;
                this.spinner.hide('contactSearchSpinner');
                this.spinnerStatus = false;
            });
        }), error => {
            this.searchResult = [];
            this.spinner.hide('contactSearchSpinner');
            this.spinnerStatus = false;
        });
        this.spinnerStatus = false;
        let backDropElement = document.getElementsByClassName('cdk-overlay-dark-backdrop')[0] as HTMLElement;
        backDropElement!.style.background = 'transparent';
    }

    showSpinner() {
        this.spinnerStatus = true;
        this.spinner.show('contactSearchSpinner');
        setTimeout(() => {
            this.spinner.hide('contactSearchSpinner');
            this.spinnerStatus = false;
        }, 2000);
    }

    clearSearchInput() {
        this.searchFormControl.setValue('');
        this.inputElement.nativeElement.select();
        this.inputElement.nativeElement.focus();
        this.searchResult = [];
    }

    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }

    /**
     *
     * @param storage
     */
    handleNavigation(storage: Search12CoItem) {
        this.router.navigateByUrl(`apps/databank/box/folders/${ storage.id }`);
    }
}
