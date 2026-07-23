import {Component, Directive, NgModule, Pipe} from '@angular/core';

@Component({
  selector: 'std-cmp',
  template: '',
})
export class StandaloneComponent {}

@Directive({
  selector: '[std-dir]',
})
export class StandaloneDirective {}

@Pipe({
  name: 'stdPipe',
})
export class StandalonePipe {
  transform(value: unknown) {
    return value;
  }
}

@NgModule({
  imports: [StandaloneComponent, StandaloneDirective, StandalonePipe],
  exports: [StandaloneComponent, StandaloneDirective, StandalonePipe],
})
export class ConsumerModule {}
