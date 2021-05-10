import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { DirectiveExplorerComponent } from './directive-explorer.component';
import { DirectiveForestComponent } from './directive-forest/directive-forest.component';
import { FilterComponent } from './directive-forest/filter/filter.component';
import { MatTreeModule } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PropertyTabModule } from './property-tab/property-tab.module';
import { DirectiveForestModule } from './directive-forest/directive-forest.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { AngularSplitModule } from '../../vendor/angular-split/lib/module';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [DirectiveExplorerComponent, DirectiveForestComponent, FilterComponent],
  exports: [DirectiveExplorerComponent],
  imports: [
    MatTreeModule,
    MatCardModule,
    ScrollingModule,
    MatIconModule,
    CommonModule,
    PropertyTabModule,
    MatButtonModule,
    MatSnackBarModule,
    AngularSplitModule,
    DirectiveForestModule,
    MatTooltipModule,
  ],
})
export class DirectiveExplorerModule {}
