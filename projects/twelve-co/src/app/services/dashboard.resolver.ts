import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { DashboardResponse, DashboardService } from 'core-lib';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DashboardResolver implements Resolve<Observable<DashboardResponse>> {
    constructor(private dashboardService: DashboardService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<DashboardResponse> {
        console.debug('Called resovler');
        return this.dashboardService.getDashboardForAccount();
    }
}
