import {ScrollingModule} from '@angular/cdk/scrolling';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatTreeModule} from '@angular/material/tree';

import {AngularSplitModule} from '../../vendor/angular-split/lib/module';

import {DirectiveExplorerComponent} from './directive-explorer.component';
import {DirectiveForestComponent} from './directive-forest/directive-forest.component';
import {DirectiveForestModule} from './directive-forest/directive-forest.module';
import {FilterComponent} from './directive-forest/filter/filter.component';
import {PropertyTabModule} from './property-tab/property-tab.module';

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
export class DirectiveExplorerModule {
}
