import {NgModule, Component} from '@angular/core';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'feature-component',
  template: 'foo.html'
})
export class FeatureComponent {}

@NgModule({
  declarations: [
    FeatureComponent
  ],
  imports: [
    RouterModule.forChild([
      { path: '', component: FeatureComponent },
      { path: 'd', loadChildren: './default.module' }
      { path: 'e', loadChildren: 'feature/feature.module#FeatureModule' }
    ])
  ]
})
export class Feature2Module {}
