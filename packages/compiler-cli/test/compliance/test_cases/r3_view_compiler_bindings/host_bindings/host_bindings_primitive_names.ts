import {Directive, HostBinding, NgModule} from '@angular/core';

@Directive({
  selector: '[hostBindingDir]',
  host: {
    '[class.a]': 'true',
    '[class.b]': 'false',
  }
})
export class HostBindingDir {
  @HostBinding('class.c') true: any;
  @HostBinding('class.d') false: any;
  @HostBinding('class.e') other: any;
}

@NgModule({declarations: [HostBindingDir]})
export class MyModule {
}
