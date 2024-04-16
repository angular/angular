// #docplaster
import {NgModule} from '@angular/core';
// #docregion componentmoduledeclaration
// Your component path
import {ComponentOverviewComponent} from './component-overview.component';

@NgModule({
  declarations: [
    // Existing Components
   ComponentOverviewComponent
  ]
  // Rest of the Module Content
})
// #enddocregion componentmoduledeclaration
export class ComponentOverviewModule {}
