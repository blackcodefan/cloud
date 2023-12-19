import { QrLoginService } from './../../services/qr-login.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from 'core-lib';
import { SubSink } from 'subsink';

@Component({
    selector: 'app-replace-device',
    templateUrl: './replace-device.component.html',
    styleUrls: ['./replace-device.component.scss']
})
export class ReplaceDeviceComponent implements OnInit, OnDestroy {

    formGroup: UntypedFormGroup;
    subSink = new SubSink();
    token: string;
    tokenInvalid = false;
    qrData: { data: string, uriData: string, uuid: string };

    constructor(private route: ActivatedRoute, private router: Router, private loader: LoaderService,
        private matSnack: MatSnackBar, private fb: UntypedFormBuilder, private qrLoginService: QrLoginService) { }

    ngOnDestroy(): void {
        console.log("unsubscribed ddddd")
        this.subSink.unsubscribe();
    }

    ngOnInit(): void {
        const pmap = this.route.snapshot.queryParamMap;
        this.token = pmap.get('token') as string;
        // console.log(this.token);
        if (!this.token || this.token.length !== 36) {
            this.tokenInvalid = true;
        }
        this.getQrCode();
    }

    close() {

    }

    /**
     * Get qr code
     */
     getQrCode() {
        this.subSink.sink = this.qrLoginService.getReplaceLostDeviceQrToken(this.token).subscribe(qrData => {
            this.qrData = qrData;
            console.log('qrdata', qrData);
            }, error => {
                console.log("Error geting QR data", error?.error?.message)
                this.matSnack.open('Error in display QR code: ', error?.error?.message);
            });
        setTimeout(() => this.router.navigateByUrl('/'), 30000);
    }
}
