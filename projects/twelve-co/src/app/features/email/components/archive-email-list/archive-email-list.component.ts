import { Store } from '@ngrx/store';
import { Component, OnInit } from '@angular/core';
import { pipe } from 'rxjs';
import { Label } from '../../model';

@Component({
  selector: 'app-archive-email-list',
  templateUrl: './archive-email-list.component.html',
  styleUrls: ['./archive-email-list.component.scss']
})
export class ArchiveEmailListComponent implements OnInit {

    labelId: string;

  constructor(
      private store: Store<any>
  ) {
    // this.store.select(pipe(getFixedLabels)).subscribe((labels: Array<Label>) => {
    //     this.labelId = labels[5].id;
    // });
  }

  ngOnInit(): void {
  }

}
