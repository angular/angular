import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';

import {BreadcrumbsComponent} from './breadcrumbs.component';

@NgModule({
  declarations: [BreadcrumbsComponent],
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  exports: [BreadcrumbsComponent],
})
export class BreadcrumbsModule {
}
