import {Component, Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'double',
})
export class DoublePipe implements PipeTransform {
  transform(value: number) {
    return value * 2;
  }
}

@Component({
  template: `
    @let foo = (value | double) + 3;
    {{foo}}
  `,
  imports: [DoublePipe],
})
export class MyApp {
  value = 1;
}
