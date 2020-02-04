import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevToolsTabsComponent } from './devtools-tabs.component';

import { MatTabsModule } from '@angular/material/tabs';
import { DirectiveExplorerModule } from './directive-explorer/directive-explorer.module';
import { ProfilerModule } from './directive-explorer/profiler/profiler.module';

@NgModule({
  declarations: [DevToolsTabsComponent],
  imports: [MatTabsModule, DirectiveExplorerModule, ProfilerModule, CommonModule],
  exports: [DevToolsTabsComponent]
})
export class DevToolsTabModule {}
