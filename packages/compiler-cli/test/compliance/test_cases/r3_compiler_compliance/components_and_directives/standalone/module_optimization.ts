import {Component, Directive, NgModule} from '@angular/core';

@Component({
  standalone: true,
  selector: 'standalone-cmp',
  template: '',
})
export class StandaloneCmp {
}

@Directive({standalone: true})
export class StandaloneDir {
}

@NgModule({
  imports: [StandaloneCmp, StandaloneDir],
})
export class Module {
}