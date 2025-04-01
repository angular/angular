import {Directive, NgModule} from '@angular/core';

@Directive({
    selector: '[hostAttributeDir]', host: { '[attr.required]': 'required' },
    standalone: false
})
export class HostAttributeDir {
  required = true;
}

@NgModule({declarations: [HostAttributeDir]})
export class MyModule {
}
