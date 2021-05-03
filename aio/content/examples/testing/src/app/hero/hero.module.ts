import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { routedComponents, HeroRoutingModule } from './hero-routing.module';

@NgModule({
  imports:      [ SharedModule, HeroRoutingModule ],
  declarations: [ routedComponents ]
})
export class HeroModule { }
