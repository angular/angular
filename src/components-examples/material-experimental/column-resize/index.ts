import {NgModule} from '@angular/core';
import {
  DefaultEnabledColumnResizeFlexExampleModule
} from './default-enabled-column-resize-flex/default-enabled-column-resize-flex-example-module';
import {
  DefaultEnabledColumnResizeExampleModule
} from './default-enabled-column-resize/default-enabled-column-resize-example-module';
import {
  OptInColumnResizeExampleModule
} from './opt-in-column-resize/opt-in-column-resize-example-module';

export {
  DefaultEnabledColumnResizeExample
} from './default-enabled-column-resize/default-enabled-column-resize-example';
export {
  DefaultEnabledColumnResizeExampleModule
} from './default-enabled-column-resize/default-enabled-column-resize-example-module';

export {
  DefaultEnabledColumnResizeFlexExample
} from './default-enabled-column-resize-flex/default-enabled-column-resize-flex-example';
export {
  DefaultEnabledColumnResizeFlexExampleModule
} from './default-enabled-column-resize-flex/default-enabled-column-resize-flex-example-module';

export {
  OptInColumnResizeExample
} from './opt-in-column-resize/opt-in-column-resize-example';
export {
  OptInColumnResizeExampleModule
} from './opt-in-column-resize/opt-in-column-resize-example-module';


@NgModule({
  exports: [
    DefaultEnabledColumnResizeExampleModule,
    DefaultEnabledColumnResizeFlexExampleModule,
    OptInColumnResizeExampleModule,
  ],
})
export class ColumnResizeExamplesModule {
}
