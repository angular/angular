import {Component, NgModule, Pipe} from '@angular/core';

@Pipe({
  name: 'number',
  standalone: false,
})
export class PipeA {
  transform() {}
}

@NgModule({
  declarations: [PipeA],
  exports: [PipeA],
})
export class ModuleA {}

@Pipe({
  name: 'number',
  standalone: false,
})
export class PipeB {
  transform() {}
}

@NgModule({
  declarations: [PipeB],
  exports: [PipeB],
})
export class ModuleB {}

@Component({
  selector: 'app',
  template: '{{ count | number }}',
  standalone: false,
})
export class App {
  count = 0;
}

@NgModule({
  imports: [ModuleA, ModuleB],
  declarations: [App],
})
export class ModuleC {}
