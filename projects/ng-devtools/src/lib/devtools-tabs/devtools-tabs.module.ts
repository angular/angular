import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevToolsTabsComponent } from './devtools-tabs.component';

import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

import { DirectiveExplorerModule } from './directive-explorer/directive-explorer.module';
import { ProfilerModule } from './directive-explorer/profiler/profiler.module';

@NgModule({
  declarations: [DevToolsTabsComponent],
  imports: [MatTabsModule, MatIconModule, DirectiveExplorerModule, ProfilerModule, CommonModule],
  exports: [DevToolsTabsComponent]
})
export class DevToolsTabModule { }
