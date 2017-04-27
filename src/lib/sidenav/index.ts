import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdCommonModule} from '../core';
import {A11yModule} from '../core/a11y/index';
import {OverlayModule} from '../core/overlay/overlay-directives';
import {MdSidenav, MdSidenavContainer} from './sidenav';


@NgModule({
  imports: [CommonModule, MdCommonModule, A11yModule, OverlayModule],
  exports: [MdSidenavContainer, MdSidenav, MdCommonModule],
  declarations: [MdSidenavContainer, MdSidenav],
})
export class MdSidenavModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdSidenavModule,
      providers: []
    };
  }
}


export * from './sidenav';
