import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DevToolsTabsComponent } from './devtools-tabs.component';

import { MatTabsModule } from '@angular/material/tabs';
import { ComponentExplorerModule } from './component-explorer/component-explorer.module';
import { ProfilerModule } from './component-explorer/profiler/profiler.module';

@NgModule({
  declarations: [DevToolsTabsComponent],
  imports: [MatTabsModule, ComponentExplorerModule, ProfilerModule, CommonModule],
  exports: [DevToolsTabsComponent]
})
export class DevToolsTabModule {}
