import {Component, Directive, NgModule} from '@angular/core';

@Component({
  selector: 'standalone-cmp',
  template: '',
})
export class StandaloneCmp {
}

@Directive({})
export class StandaloneDir {
}

@NgModule({
  imports: [StandaloneCmp, StandaloneDir],
})
export class Module {
}