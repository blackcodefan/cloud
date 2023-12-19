import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterArray',
})
export class FilterArrayPipe implements PipeTransform {

    transform<T>(array: Array<T>, key: string, flag: boolean = true): Array<T> {
        const arrayOfApps = array.filter(a => a[key] == flag);
        console.debug(arrayOfApps);
        return arrayOfApps;
    }

}
