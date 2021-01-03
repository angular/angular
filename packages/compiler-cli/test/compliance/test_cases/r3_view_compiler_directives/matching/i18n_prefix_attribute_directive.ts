import {Component, Directive, NgModule} from '@angular/core';

@Directive({selector: '[i18n]'})
export class I18nDirective {
}

@Directive({selector: '[i18n-foo]'})
export class I18nFooDirective {
}

@Directive({selector: '[foo]'})
export class FooDirective {
}

@Component({selector: 'my-component', template: '<div i18n-foo></div>'})
export class MyComponent {
}

@NgModule({declarations: [I18nDirective, I18nFooDirective, FooDirective, MyComponent]})
export class MyModule {
}
