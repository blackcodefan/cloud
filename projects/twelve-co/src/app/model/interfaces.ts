import { SafeUrl } from '@angular/platform-browser';

export interface UserLoginData {
  uuid: string,
  token: string,
  username: string
}

export interface QrData {
  uuid: string,
  qrImage: string
}

export interface QrDataSafe {
  uuid: string,
  qrImage: SafeUrl
}


export interface UserAndToken {
  authToken: string;
  userId: number;
}
