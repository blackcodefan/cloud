import {AfterViewInit, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { DomService } from 'core-lib';
import { SidebarSettingsComponent } from './components/sidebar-settings/sidebar-settings.component';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: [ './settings.component.scss' ],
})
export class SettingsComponent implements OnInit, AfterViewInit {
    selectedSetting!: string;
    sidebarStatus: boolean = true;
    listOfSettings = [
        { title: 'account', path: '/apps/settings/account' },
        { title: 'devices', path: '/apps/settings/security' },
        { title: 'password', path: '/apps/settings/password' },
        { title: 'sessions', path: '/apps/settings/sessions' },
    ];

    constructor(private router: Router, private cdk: ChangeDetectorRef, private domService: DomService) {
    }

    ngOnInit(): void {
        this.domService.appendComponentToSidebar(SidebarSettingsComponent);
        // this.domService.appendComponentToBody(SidebarSettingsComponent);
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.domService.setIsLoading(true);
        }, 1000);
    }

    handleDifferentSetting(newApp: any) {
        console.log('handling different setting');
        this.selectedSetting = newApp as string;
        this.cdk.detectChanges();
    }

    showSidebar() {
        this.sidebarStatus = true;
    }
}
