import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [BreadcrumbsComponent],
  imports: [CommonModule, MatButtonModule],
  exports: [BreadcrumbsComponent],
})
export class DirectiveForestModule {}
