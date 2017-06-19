import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IndexComponent } from './index.component';
import { FormControlsComponent } from './form-controls/form-controls.component';
import { DevToolsComponent } from './dev-tools/dev-tools.component';
import { ErrorDemoComponent } from './managing-focus/error-demo.component';
import { ManagingFocusComponent } from './managing-focus/managing-focus.component';
import { ComponentRolesComponent } from './component-roles/component-roles.component';
import { DevToolsIndexComponent } from './dev-tools/dev-tools-index.component';
import { PassComponent } from './dev-tools/pass/pass.component';
import { FailsComponent } from './dev-tools/fails/fails.component';
import { InputWrapperComponent } from './form-controls/input-wrapper.component';
import { CustomButtonComponent } from './shared/custom-button.component';
import { CustomControlComponent } from './shared/custom-control.component';
import { ValueHelperComponent } from './shared/value-helper.component';
import { HelperService } from './services/helper.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    IndexComponent,
    ComponentRolesComponent,
    FailsComponent,
    PassComponent,
    DevToolsIndexComponent,
    DevToolsComponent,
    FormControlsComponent,
    InputWrapperComponent,
    ErrorDemoComponent,
    ManagingFocusComponent,
    CustomButtonComponent,
    CustomControlComponent,
    ValueHelperComponent
  ],
  providers: [ HelperService ],
  bootstrap: [ AppComponent ]
})
export class AppModule {}
