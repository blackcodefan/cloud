import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { UserNotificationService } from 'core-lib';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: [ './password.component.scss' ],
})
export class PasswordComponent implements OnInit {
  passwordFormGroup: UntypedFormGroup;

  constructor(private notificationService: UserNotificationService) {
  }

  ngOnInit(): void {
    this.passwordFormGroup = new UntypedFormGroup({
      currentPassword: new UntypedFormControl('', [ Validators.required ]),
      newPassword: new UntypedFormControl('', [ Validators.required ]),
      checkPassword: new UntypedFormControl('', [ Validators.required ]),
    });
  }

  onUpdatePasswordClicked() {
    if (this.passwordFormGroup.controls.newPassword.value !== this.passwordFormGroup.controls.checkPassword.value) {
      this.notificationService.showError('New password does not match');
    }
  }
}
