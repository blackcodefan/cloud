import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { CallComponent, CoreLibModule } from 'core-lib';
import { AloHomeComponent } from './alo-home.component';
import { CallsComponent } from './components/calls/calls.component';
import { HeaderComponent } from './components/header/header.component';
import { aloAppReducers } from './store/calls.reducers';

const routes: Routes = [ {
    path: '', component: AloHomeComponent,
    children: [ {
        path: '',
        component: CallsComponent,
        pathMatch: 'full',
    }, {
        path: 'video-call',
        component: CallComponent,
    } ],
} ];

@NgModule({
    declarations: [ CallsComponent, HeaderComponent, AloHomeComponent ],
    imports: [
        CommonModule,
        CoreLibModule,
        TranslateModule.forChild(),
        RouterModule.forChild(routes),
        StoreModule.forFeature('aloStateKey', aloAppReducers),
    ],
})
export class AloModule {
}
