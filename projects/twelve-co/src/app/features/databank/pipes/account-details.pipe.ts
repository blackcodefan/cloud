import { Pipe, PipeTransform } from '@angular/core';
import { UserServiceService } from 'core-lib';

@Pipe({
    name: 'account_details',
})
export class AccountDetailsPipe implements PipeTransform {
    constructor(private userService: UserServiceService) {
    }

    transform(accountId: string | number) {
        return this.userService.fetchAccountInformation(accountId);
    }

}
