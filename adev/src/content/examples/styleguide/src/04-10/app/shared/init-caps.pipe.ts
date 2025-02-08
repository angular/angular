// #docregion
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'initCaps',
  standalone: false,
})
export class InitCapsPipe implements PipeTransform {
  transform = (value: string) => value;
}
