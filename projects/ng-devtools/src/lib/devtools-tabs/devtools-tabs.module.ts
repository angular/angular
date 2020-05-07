import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevToolsTabsComponent } from './devtools-tabs.component';

import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

import { DirectiveExplorerModule } from './directive-explorer/directive-explorer.module';
import { ProfilerModule } from './profiler/profiler.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  declarations: [DevToolsTabsComponent],
  imports: [
    MatTabsModule,
    MatIconModule,
    DirectiveExplorerModule,
    ProfilerModule,
    CommonModule,
    MatMenuModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
  exports: [DevToolsTabsComponent],
})
export class DevToolsTabModule {}
