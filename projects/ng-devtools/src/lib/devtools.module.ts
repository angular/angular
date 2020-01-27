import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DevToolsComponent } from './devtools.component';
import { DevToolsTabModule } from './devtools-tabs/devtools-tabs.module';

@NgModule({
  declarations: [DevToolsComponent],
  imports: [CommonModule, DevToolsTabModule],
  exports: [DevToolsComponent],
})
export class DevToolsModule {}
