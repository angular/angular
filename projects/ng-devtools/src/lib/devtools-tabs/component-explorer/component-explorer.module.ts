import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { ComponentExplorerComponent } from './component-explorer.component';
import { ComponentTreeComponent } from './component-tree/component-tree.component';
import { PropertyViewModule } from './property-view/property-view.module';
import { MatTreeModule } from '@angular/material/tree';

@NgModule({
  declarations: [ComponentExplorerComponent, ComponentTreeComponent],
  exports: [ComponentExplorerComponent],
  imports: [MatTreeModule, MatIconModule, CommonModule, PropertyViewModule],
})
export class ComponentExplorerModule {}
