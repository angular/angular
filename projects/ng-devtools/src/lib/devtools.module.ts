import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DevToolsComponent } from './devtools.component';
import { DevToolsTabModule } from './devtools-tabs/devtools-tabs.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [DevToolsComponent],
  imports: [CommonModule, DevToolsTabModule, MatProgressSpinnerModule, MatTooltipModule],
  exports: [DevToolsComponent],
})
export class DevToolsModule {}
