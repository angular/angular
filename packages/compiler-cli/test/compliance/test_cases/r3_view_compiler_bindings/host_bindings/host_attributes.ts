import {Directive, NgModule} from '@angular/core';

@Directive({
    selector: '[hostAttributeDir]', host: { 'aria-label': 'label' },
    standalone: false
})
export class HostAttributeDir {
}

@NgModule({declarations: [HostAttributeDir]})
export class MyModule {
}
