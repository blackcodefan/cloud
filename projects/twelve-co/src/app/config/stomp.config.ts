import { RxStompConfig } from '@stomp/rx-stomp';
import { DeviceTypeEnum } from 'core-lib';
import { environment } from '../../environments/environment';

export const stompConfig: RxStompConfig = {
    // Which server?
    brokerURL: environment.wsUrl + 'connect',

    // Headers
    // Typical keys: login, passcode, host
    connectHeaders: {
        login: 'guest',
        device: DeviceTypeEnum.WEB,
    },

    // How often to heartbeat?
    // Interval in milliseconds, set to 0 to disable
    heartbeatIncoming: 0, // Typical value 0 - disabled
    heartbeatOutgoing: 20000, // Typical value 20000 - every 20 seconds

    // Wait in milliseconds before attempting auto reconnect
    // Set to 0 to disable
    // Typical value 500 (500 milli seconds)
    reconnectDelay: 1000,

    // Will log diagnostics on console
    // It can be quite verbose, not recommended in production
    // Skip this key to stop logging to console
    debug: (msg: string): void => {
        if (!environment.production) {
            console.log(new Date(), msg);
        }
    },
};
