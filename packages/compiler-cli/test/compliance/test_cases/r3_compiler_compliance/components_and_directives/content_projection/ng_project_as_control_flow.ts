import { Component, NgModule } from '@angular/core';

@Component({
    selector: 'simple', template: '<div><ng-content select="[title]"></ng-content></div>',
    standalone: false
})
export class SimpleComponent {
}

@Component({
    selector: 'my-app',
    template: `
    <simple>@if (true) { <h1 ngProjectAs="[title]"></h1> }</simple>
    <simple>@for (item of [1]; track item) { <h2 ngProjectAs="[title]"></h2> }</simple>
    <simple>
      @switch (true) {
        @case (true) { <h3 ngProjectAs="[title]"></h3> }
      }
    </simple>
  `,
    imports: [SimpleComponent],
})
export class MyApp {
}

@NgModule({ declarations: [MyApp, SimpleComponent] })
export class MyModule {
}
