// #docregion
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {ActorFormTemplateComponent} from './template/actor-form-template.component';
import {ActorFormReactiveComponent} from './reactive/actor-form-reactive.component';
import {ForbiddenValidatorDirective} from './shared/forbidden-name.directive';
import {UnambiguousRoleValidatorDirective} from './shared/unambiguous-role.directive';
import {UniqueRoleValidatorDirective} from './shared/role.directive';

@NgModule({
  imports: [BrowserModule, FormsModule, ReactiveFormsModule],
  declarations: [
    AppComponent,
    ActorFormTemplateComponent,
    ActorFormReactiveComponent,
    ForbiddenValidatorDirective,
    UnambiguousRoleValidatorDirective,
    UniqueRoleValidatorDirective,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
