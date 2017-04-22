// #docregion
import { NgModule }     from '@angular/core';
import { CommonModule } from '@angular/common';

import { ForbiddenValidatorDirective } from './forbidden-name.directive';
import { SubmittedComponent }          from './submitted.component';

@NgModule({
  imports:      [ CommonModule],
  declarations: [ ForbiddenValidatorDirective, SubmittedComponent ],
  exports:      [ ForbiddenValidatorDirective, SubmittedComponent,
                  CommonModule ]
})
export class SharedModule { }
