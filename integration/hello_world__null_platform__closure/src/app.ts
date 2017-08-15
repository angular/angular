import {HelloWorldComponent} from './hello-world.component';

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DomRendererModule} from '@angular/platform/dom';

@NgModule({
  declarations: [HelloWorldComponent],
  bootstrap: [HelloWorldComponent],
  imports: [DomRendererModule, CommonModule],
})
export class AppModule {}
