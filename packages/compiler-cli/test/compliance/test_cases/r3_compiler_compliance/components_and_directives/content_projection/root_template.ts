import {Component, Directive, NgModule, TemplateRef} from '@angular/core';

@Component({selector: 'simple', template: '<div><ng-content></ng-content></div>'})
export class SimpleComponent {
}

@Component({
  selector: 'complex',
  template: `
    <div id="first"><ng-content select="span[title=toFirst]"></ng-content></div>
    <div id="second"><ng-content SELECT="span[title=toSecond]"></ng-content></div>`
})
export class ComplexComponent {
}

@Component({selector: 'my-app', template: '<simple>content</simple> <complex></complex>'})
export class MyApp {
}

@NgModule({declarations: [SimpleComponent, ComplexComponent, MyApp]})
export class MyModule {
}
