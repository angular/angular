import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'host-binding-comp', host: { '[id]': '["red", id]' }, template: '',
    standalone: false
})
export class HostBindingComp {
  id = 'some id';
}

@NgModule({declarations: [HostBindingComp]})
export class MyModule {
}
