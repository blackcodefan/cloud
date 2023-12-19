import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlockchainCheckerComponent, DashboardComponent, ForgottenPasswordComponent, HomeComponent, LoginComponent, ReplaceDeviceComponent } from './components';
import { AppShellComponent } from './components/app-shell/app-shell.component';
import { AuthGuardService } from './services';
import { DashboardResolver } from './services/dashboard.resolver';

const routes: Routes = [
    { path: '', pathMatch: 'full', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'forgot-password', component: ForgottenPasswordComponent },
    { path: 'lost-device', component: ReplaceDeviceComponent },
    { path: 'validator', component: BlockchainCheckerComponent },
    {
        path: 'apps', component: AppShellComponent,
        canActivate: [ AuthGuardService ],
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
            {
                path: 'dashboard', component: DashboardComponent, resolve: {
                    dashboard: DashboardResolver,
                },
            },
            { path: 'settings', loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule), canActivate: [ AuthGuardService ] },
            { path: 'alo', loadChildren: () => import('./features/alo/alo.module').then(m => m.AloModule), canActivate: [ AuthGuardService ] },
            { path: 'tasks', loadChildren: () => import('./features/agile/agile.module').then(m => m.AgileModule), canActivate: [ AuthGuardService ] },
            { path: 'notes', loadChildren: () => import('./features/notes/notes.module').then(m => m.NotesModule), canActivate: [ AuthGuardService ] },
            { path: 'emails', loadChildren: () => import('./features/email/email.module').then(m => m.EmailModule), canActivate: [ AuthGuardService ] },
            { path: 'databank', loadChildren: () => import('./features/databank/databank.module').then(m => m.DatabankModule), canActivate: [ AuthGuardService ] },
            { path: 'calendar', loadChildren: () => import('./features/calendar/calendar.module').then(m => m.CalendarModule), canActivate: [ AuthGuardService ] },
            { path: 'contacts', loadChildren: () => import('./features/contacts/contacts.module').then(m => m.ContactsModule), canActivate: [ AuthGuardService ] },
            { path: 'excel', loadChildren: () => import('./features/excel/excel.module').then(m => m.ExcelModule), canActivate: [ AuthGuardService ] },
            { path: 'words', loadChildren: () => import('./features/words/words.module').then(m => m.WordsModule), canActivate: [ AuthGuardService ] },
            { path: 'albums', loadChildren: () => import('./features/albums/albums.module').then(m => m.AlbumsModule), canActivate: [ AuthGuardService ] },
        ],
    },

];

@NgModule({
    imports: [ RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' }) ],
    exports: [ RouterModule ],
})
export class AppRoutingModule {
}
