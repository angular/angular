// #docregion
import { NgModule }     from '@angular/core';
import { FormsModule }  from '@angular/forms';

import { SharedModule }               from '../shared/shared.module';
import { HeroFormTemplate1Component } from './hero-form-template1.component';
import { HeroFormTemplate2Component } from './hero-form-template2.component';

@NgModule({
  imports:      [ SharedModule, FormsModule ],
  declarations: [ HeroFormTemplate1Component, HeroFormTemplate2Component ],
  exports:      [ HeroFormTemplate1Component, HeroFormTemplate2Component ]
})
export class HeroFormTemplateModule { }
