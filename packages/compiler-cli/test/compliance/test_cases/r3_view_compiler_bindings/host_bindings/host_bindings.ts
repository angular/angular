import {Directive, HostBinding, NgModule} from '@angular/core';

@Directive({
    selector: '[hostBindingDir]',
    standalone: false
})
export class HostBindingDir {
  @HostBinding('id') dirId = 'some id';
}

@NgModule({declarations: [HostBindingDir]})
export class MyModule {
}
