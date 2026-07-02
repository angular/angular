import {Component, Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'test'})
export class TestPipe implements PipeTransform {
  transform(value: Function) {
    return value;
  }
}

@Component({
  template: `
    {{(a, b) => a + b | test}}
    <hr>
    {{(a, b) => a + b + componentProp | test}}
  `,
  imports: [TestPipe]
})
export class TestComp {
  componentProp = 0;
}
