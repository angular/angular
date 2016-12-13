import {NgModule, Component} from '@angular/core';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'lazy-comp',
  template: 'lazy!'
})
export class LazyComponent {}

@NgModule({
  imports: [
    RouterModule.forChild([
     {path: '', component: LazyComponent, pathMatch: 'full'},
     {path: 'feature', loadChildren: './feature/feature.module#FeatureModule'},
     {path: 'lazy-feature', loadChildren: './feature/lazy-feature.module#LazyFeatureModule'}
    ])
  ],
  declarations: [LazyComponent]
})
export class LazyModule {
}

export class SecondModule {}
