import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, ActivationStart, Router, UrlSegment } from '@angular/router';
import { Location } from '@angular/common';
import { select, Store } from '@ngrx/store';
import { SubSink } from 'subsink';
import { selectLoggedInState, State } from '../store';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private subsink = new SubSink();
  private loggedIn: boolean;

  constructor(private store: Store<State>, private router: Router, private activatedRoute: ActivatedRoute, location: Location) {
    this.subsink.sink = this.store.pipe(select(selectLoggedInState)).subscribe(mm => this.loggedIn = mm);
    this.subsink.sink = this.router.events.subscribe((val) => {
      if (val instanceof ActivationStart && this.loggedIn) {
        const loc = location.path();
        console.log('|', loc, '|');
        if (loc.length === 0) {
          // this.router.navigateByUrl('/');
        }
        // const url = (activatedRoute.snapshot as any)._routerState.url;
        // console.log('-**************************************> ', this.router.url);
        // console.log('/////////////// ', location.path());
        // const rte: Array<UrlSegment> = (val as ActivationStart).snapshot.url;
        // console.log('++++++->     ', activatedRoute);
        // console.log('->>>>>>>>>>>> ', rte, '->>>  ', rte.length);
        // console.log('-logged in  > ', this.loggedIn);
      }
    });
  }

  ngOnDestroy() {
    this.subsink.unsubscribe();
  }
}
