// #docplaster
// #docregion
import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';

import { LoginComponent }    from './login/login.component';
import { AuthRoutingModule } from './auth-routing.module';

// #docregion v1
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
// #enddocregion v1
    AuthRoutingModule
// #docregion v1
  ],
  declarations: [
    LoginComponent
  ]
})
export class AuthModule {}
// #enddocregion v1
// #enddocregion
