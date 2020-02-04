import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DevToolsComponent } from './devtools.component';
import { DevToolsTabModule } from './devtools-tabs/devtools-tabs.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [DevToolsComponent],
  imports: [CommonModule, DevToolsTabModule, MatProgressSpinnerModule],
  exports: [DevToolsComponent],
})
export class DevToolsModule {}
