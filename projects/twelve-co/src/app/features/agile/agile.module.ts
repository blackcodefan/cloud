import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CoreLibModule } from 'core-lib';
import { GanttComponent } from './components/gantt/gantt.component';
import { HomeAgileComponent } from './home-agile.component';
import { AgileLeftSidebarComponent } from './layout/left-sidebar/agile-left-sidebar/agile-left-sidebar.component';
import { AgileHeaderComponent } from './components/agile-header/agile-header.component';


export const routes = [
    {
        path: '', component: HomeAgileComponent, children: [
            { path: '', component: GanttComponent },
        ],
    },
];

@NgModule({
    declarations: [
        HomeAgileComponent,
        GanttComponent,
        AgileLeftSidebarComponent,
        AgileHeaderComponent,
    ],
    imports: [
        CommonModule,
        CoreLibModule,
        TranslateModule.forChild(),
        RouterModule.forChild(routes),
    ],
})
export class AgileModule {
}
