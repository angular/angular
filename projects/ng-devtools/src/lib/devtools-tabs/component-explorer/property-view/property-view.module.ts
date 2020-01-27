import { NgModule } from '@angular/core';
import { PropertyViewComponent } from './property-view.component';
import { CommonModule } from '@angular/common';
import { MatTreeModule } from '@angular/material/tree';

@NgModule({
  declarations: [PropertyViewComponent],
  imports: [MatTreeModule, CommonModule],
  exports: [PropertyViewComponent]
})
export class PropertyViewModule {}
