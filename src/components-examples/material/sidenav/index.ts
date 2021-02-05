import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {SidenavAutosizeExample} from './sidenav-autosize/sidenav-autosize-example';
import {SidenavBackdropExample} from './sidenav-backdrop/sidenav-backdrop-example';
import {SidenavDisableCloseExample} from './sidenav-disable-close/sidenav-disable-close-example';
import {
  SidenavDrawerOverviewExample
} from './sidenav-drawer-overview/sidenav-drawer-overview-example';
import {SidenavFixedExample} from './sidenav-fixed/sidenav-fixed-example';
import {SidenavModeExample} from './sidenav-mode/sidenav-mode-example';
import {SidenavOpenCloseExample} from './sidenav-open-close/sidenav-open-close-example';
import {SidenavOverviewExample} from './sidenav-overview/sidenav-overview-example';
import {SidenavPositionExample} from './sidenav-position/sidenav-position-example';
import {SidenavResponsiveExample} from './sidenav-responsive/sidenav-responsive-example';
import {SidenavHarnessExample} from './sidenav-harness/sidenav-harness-example';

export {
  SidenavAutosizeExample,
  SidenavBackdropExample,
  SidenavDisableCloseExample,
  SidenavDrawerOverviewExample,
  SidenavHarnessExample,
  SidenavFixedExample,
  SidenavModeExample,
  SidenavOpenCloseExample,
  SidenavOverviewExample,
  SidenavPositionExample,
  SidenavResponsiveExample,
};

const EXAMPLES = [
  SidenavAutosizeExample,
  SidenavBackdropExample,
  SidenavDisableCloseExample,
  SidenavDrawerOverviewExample,
  SidenavHarnessExample,
  SidenavFixedExample,
  SidenavModeExample,
  SidenavOpenCloseExample,
  SidenavOverviewExample,
  SidenavPositionExample,
  SidenavResponsiveExample,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatListModule,
    MatRadioModule,
    MatSidenavModule,
    MatSelectModule,
    MatToolbarModule,
    ReactiveFormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class SidenavExamplesModule {
}
