import { Component, OnInit } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { select, Store } from '@ngrx/store';
import { Device } from 'core-lib';
import { SubSink } from 'subsink';
import { selectSelectedAccount } from '../../../../store';
import { SettingsService } from '../../services/settings.service';

@Component({
    selector: 'app-security',
    templateUrl: './security.component.html',
    styleUrls: [ './security.component.scss' ],
})
export class SecurityComponent implements OnInit {

    deviceList: Array<Device>;
    subSink = new SubSink();
    img: SafeUrl;
    qrData: { data: string, uriData: string, uuid: string };
    private selectedAccount: number;

    constructor(private settingsService: SettingsService, private store: Store<any>) {
    }

    ngOnInit(): void {

        this.subSink.sink = this.settingsService.getProfileDevices().subscribe(d => this.deviceList = d);
        this.subSink.sink = this.store.pipe(select(selectSelectedAccount)).subscribe(d => this.selectedAccount = d.id);
    }

    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }

    /**
     * Get qr code
     */
    addDevice() {
        // this.subSink.sink = this.settingsService.getQrCode(this.selectedAccount).subscribe(url => this.img = url);
        this.subSink.sink = this.settingsService.getQrCodeData().subscribe(qrData => this.qrData = qrData);
        // setTimeout(() => this.addDevice(), 30000);
    }
}
