import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { DirectiveExplorerComponent } from './directive-explorer.component';
import { DirectiveForestComponent } from './directive-forest/directive-forest.component';
import { FilterComponent } from './directive-forest/filter/filter.component';
import { MatTreeModule } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PropertyTabModule } from './property-tab/property-tab.module';
import { AngularSplitModule } from 'angular-split';
import { DirectiveForestModule } from './directive-forest/directive-forest.module';
import { ElementPropertyResolver } from './property-resolver/element-property-resolver';

@NgModule({
  declarations: [DirectiveExplorerComponent, DirectiveForestComponent, FilterComponent],
  exports: [DirectiveExplorerComponent],
  imports: [
    MatTreeModule,
    MatIconModule,
    CommonModule,
    PropertyTabModule,
    MatButtonModule,
    MatSnackBarModule,
    AngularSplitModule,
    DirectiveForestModule,
  ],
})
export class DirectiveExplorerModule {}
