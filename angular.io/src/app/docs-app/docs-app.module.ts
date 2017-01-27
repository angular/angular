import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocsAppComponent } from './docs-app.component'
import { RouterModule } from '@angular/router'

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: DocsAppComponent}
    ])
  ],
  declarations: [
    DocsAppComponent
  ]
})
export class DocsAppModule {

}
