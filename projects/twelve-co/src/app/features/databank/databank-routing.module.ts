import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivityListComponent, InvitationListComponent, MembersComponent } from './components';
import { DatabankDetailComponent } from './components/n-storage/databank-detail/databank-detail.component';
import { DatabankListComponent } from './components/n-storage/databank-list/databank-list.component';
import { DatabankComponent } from './databank.component';

const routes: Routes = [
    {
        path: '',
        component: DatabankComponent,
        children: [
            {
                path: '',
                redirectTo: 'boxList',
                pathMatch: 'full',
            }, {
                path: 'boxList',
                component: DatabankListComponent,
            }, {
                path: 'box/:folderId',
                component: DatabankDetailComponent,
            }, {
                path: 'activity/:boxId',
                component: ActivityListComponent,
            },
            {
                path: 'members/:boxId',
                component: MembersComponent,
            },
            {
                path: 'invitations',
                component: InvitationListComponent,
            },
        ],
    },
];

@NgModule({
    imports: [ RouterModule.forChild(routes) ],
    exports: [ RouterModule ],
})
export class DatabankRoutingModule {
}
