// #docplaster
import { Component, NgModule } from '@angular/core';

// #docregion standalone
@Component({
  selector: 'app-component-overview',
  template: '<h1>Hello World!</h1>',
  styles: ['h1 { font-weight: normal; }'],
  standalone: true
})
// #enddocregion standalone


// #docregion module
@NgModule({
  declarations: [
      // ... Existing Components
      ComponentOverviewComponent
  ],
   // rest of the module content
})
// #enddocregion module

export class ComponentOverviewComponent {

}