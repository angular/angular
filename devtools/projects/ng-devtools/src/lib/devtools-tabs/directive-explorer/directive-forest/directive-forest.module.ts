import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [BreadcrumbsComponent],
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  exports: [BreadcrumbsComponent],
})
export class DirectiveForestModule {}
