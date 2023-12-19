import { Pipe, PipeTransform } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';

@Pipe({
    name: 'countFormArray',
})
export class CountFormArrayPipe implements PipeTransform {

    transform(formGroup: UntypedFormGroup, formArrayName: string): number {
        const fa = formGroup.get(formArrayName) as UntypedFormArray;
        if (fa) {
            return fa.length;
        }
        return 0;
    }

}
