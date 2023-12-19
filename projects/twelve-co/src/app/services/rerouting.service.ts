import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubSink } from 'subsink';

@Injectable({
    providedIn: 'root',
})
export class ReroutingService {
    private subSink = new SubSink();

    constructor(private router: Router, private activatedRoute: ActivatedRoute) {

        //     todo add rerouting to dashboard
    }
}
