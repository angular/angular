import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { IndexComponent } from './index.component';
import { FormControlsComponent } from './form-controls/form-controls.component';
import { DevToolsComponent } from './dev-tools/dev-tools.component';
import { ManagingFocusComponent } from './managing-focus/managing-focus.component';
import { ComponentRolesComponent } from './component-roles/component-roles.component';
import { DevToolsIndexComponent } from './dev-tools/dev-tools-index.component';
import { PassComponent } from './dev-tools/pass/pass.component';
import { FailsComponent } from './dev-tools/fails/fails.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: '', component: IndexComponent },
      { path: 'form-controls', component: FormControlsComponent },
      { path: 'managing-focus', component: ManagingFocusComponent },
      { path: 'component-roles', component: ComponentRolesComponent },
      {
        path: 'dev-tools', component: DevToolsComponent, children: [
          { path: '', component: DevToolsIndexComponent },
          { path: 'fail-demo', component: FailsComponent },
          { path: 'pass-demo', component: PassComponent }
        ]
      }
    ])
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
