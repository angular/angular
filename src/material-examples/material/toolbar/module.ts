import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {ToolbarMultirowExample} from './toolbar-multirow/toolbar-multirow-example';
import {ToolbarOverviewExample} from './toolbar-overview/toolbar-overview-example';

const EXAMPLES = [
  ToolbarMultirowExample,
  ToolbarOverviewExample,
];

@NgModule({
  imports: [
    MatIconModule,
    MatToolbarModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class ToolbarExamplesModule {
}
