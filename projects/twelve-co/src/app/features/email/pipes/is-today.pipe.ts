import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isToday'
})
export class IsTodayPipe implements PipeTransform {

  today=new Date ()

  transform(incoming: string ) {
    let incomingDate = new Date (incoming);
    return incomingDate.getDay() === this.today.getDay() &&
        incomingDate.getMonth() === this.today.getMonth() &&
        incomingDate.getFullYear() === this.today.getFullYear();
  }

}
