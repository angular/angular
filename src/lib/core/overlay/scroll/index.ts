import {NgModule} from '@angular/core';
import {SCROLL_DISPATCHER_PROVIDER} from './scroll-dispatcher';
import {Scrollable} from './scrollable';
import {PlatformModule} from '../../platform/index';

export {Scrollable} from './scrollable';
export {ScrollDispatcher} from './scroll-dispatcher';

// Export pre-defined scroll strategies and interface to build custom ones.
export {ScrollStrategy} from './scroll-strategy';
export {RepositionScrollStrategy} from './reposition-scroll-strategy';
export {CloseScrollStrategy} from './close-scroll-strategy';
export {NoopScrollStrategy} from './noop-scroll-strategy';
export {BlockScrollStrategy} from './block-scroll-strategy';

@NgModule({
  imports: [PlatformModule],
  exports: [Scrollable],
  declarations: [Scrollable],
  providers: [SCROLL_DISPATCHER_PROVIDER],
})
export class ScrollDispatchModule { }
