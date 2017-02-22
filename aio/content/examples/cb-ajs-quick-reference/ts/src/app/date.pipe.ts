import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Injectable()
// #docregion date-pipe
@Pipe({name: 'date', pure: true})
export class StringSafeDatePipe extends DatePipe implements PipeTransform {
 transform(value: any, format: string): string {
   value = typeof value === 'string' ?
           Date.parse(value) : value;
   return super.transform(value, format);
 }
}
// #enddocregion date-pipe
