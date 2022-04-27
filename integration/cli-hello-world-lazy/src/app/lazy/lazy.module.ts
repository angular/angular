import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LazyRoutingModule } from './lazy-routing.module.js';
import { LazyComponent } from './lazy.component.js';


@NgModule({
  declarations: [LazyComponent],
  imports: [
    CommonModule,
    LazyRoutingModule
  ]
})
export class LazyModule { }
