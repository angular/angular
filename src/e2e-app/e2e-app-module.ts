import {NgModule, ApplicationRef} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';
import {E2EApp, Home} from './e2e-app/e2e-app';
import {IconE2E} from './icon/icon-e2e';
import {ButtonE2E} from './button/button-e2e';
import {MenuE2E} from './menu/menu-e2e';
import {BasicTabs} from './tabs/tabs-e2e';
import {MaterialModule} from '@angular2-material/all';
import {E2E_APP_ROUTES} from './e2e-app/routes';


@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(E2E_APP_ROUTES),
    MaterialModule.forRoot(),
  ],
  declarations: [
    E2EApp,
    IconE2E,
    ButtonE2E,
    MenuE2E,
    BasicTabs,
    Home,
  ],
  entryComponents: [
    E2EApp,
  ],
})
export class E2eAppModule {
  constructor(private _appRef: ApplicationRef) { }

  ngDoBootstrap() {
    this._appRef.bootstrap(E2EApp);
  }
}
