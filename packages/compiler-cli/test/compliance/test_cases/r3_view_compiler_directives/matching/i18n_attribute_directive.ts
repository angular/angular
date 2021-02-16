import {Component, Directive, NgModule} from '@angular/core';

@Directive({selector: '[i18n]'})
export class I18nDirective {
}

@Component({selector: 'my-component', template: '<div i18n></div>'})
export class MyComponent {
}

@NgModule({declarations: [I18nDirective, MyComponent]})
export class MyModule {
}
