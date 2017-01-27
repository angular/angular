import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomePageComponent } from './home-page.component';
import { RouterModule } from '@angular/router'

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: HomePageComponent }
    ])
  ],
  declarations: [HomePageComponent]
})
export class HomePageModule { }
