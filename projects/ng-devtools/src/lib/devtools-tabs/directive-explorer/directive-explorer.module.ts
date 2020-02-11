import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { DirectiveExplorerComponent } from './directive-explorer.component';
import { DirectiveForestComponent } from './directive-forest/directive-forest.component';
import { FilterComponent } from './directive-forest/filter/filter.component';
import { PropertyViewModule } from './property-view/property-view.module';
import { MatTreeModule } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [DirectiveExplorerComponent, DirectiveForestComponent, FilterComponent],
  exports: [DirectiveExplorerComponent],
  imports: [MatTreeModule, MatIconModule, CommonModule, PropertyViewModule, MatButtonModule, MatSnackBarModule],
})
export class DirectiveExplorerModule {}
