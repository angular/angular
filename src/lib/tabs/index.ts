import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PortalModule} from '../core';
import {MdRippleModule} from '../core/ripple/index';
import {ObserveContentModule} from '../core/observe-content/observe-content';
import {MdTab} from './tab';
import {MdTabGroup} from './tab-group';
import {MdTabLabel} from './tab-label';
import {MdTabLabelWrapper} from './tab-label-wrapper';
import {MdTabNavBar, MdTabLink, MdTabLinkRipple} from './tab-nav-bar/tab-nav-bar';
import {MdInkBar} from './ink-bar';
import {MdTabBody} from './tab-body';
import {VIEWPORT_RULER_PROVIDER} from '../core/overlay/position/viewport-ruler';
import {MdTabHeader} from './tab-header';
import {SCROLL_DISPATCHER_PROVIDER} from '../core/overlay/scroll/scroll-dispatcher';


@NgModule({
  imports: [CommonModule, PortalModule, MdRippleModule, ObserveContentModule],
  // Don't export all components because some are only to be used internally.
  exports: [
    MdTabGroup,
    MdTabLabel,
    MdTab,
    MdTabNavBar,
    MdTabLink,
    MdTabLinkRipple
  ],
  declarations: [
    MdTabGroup,
    MdTabLabel,
    MdTab,
    MdInkBar,
    MdTabLabelWrapper,
    MdTabNavBar,
    MdTabLink,
    MdTabBody,
    MdTabLinkRipple,
    MdTabHeader
  ],
  providers: [VIEWPORT_RULER_PROVIDER, SCROLL_DISPATCHER_PROVIDER],
})
export class MdTabsModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdTabsModule,
      providers: []
    };
  }
}


export * from './tab-group';
export {MdInkBar} from './ink-bar';
export {MdTabBody, MdTabBodyOriginState, MdTabBodyPositionState} from './tab-body';
export {MdTabHeader, ScrollDirection} from './tab-header';
export {MdTabLabelWrapper} from './tab-label-wrapper';
export {MdTab} from './tab';
export {MdTabLabel} from './tab-label';
