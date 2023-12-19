import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileName'
})
export class FileNamePipe implements PipeTransform {

    transform(value: string, extension:string|undefined ): string {
        if(extension ){
            return value.replace('.'+extension,'')
        }else{
            return value;
        }

    }

}
