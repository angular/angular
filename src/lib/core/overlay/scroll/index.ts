import {NgModule} from '@angular/core';
import {SCROLL_DISPATCHER_PROVIDER} from './scroll-dispatcher';
import {Scrollable} from './scrollable';
import {PlatformModule} from '../../platform/index';

export {Scrollable} from './scrollable';
export {ScrollDispatcher} from './scroll-dispatcher';

@NgModule({
  imports: [PlatformModule],
  exports: [Scrollable],
  declarations: [Scrollable],
  providers: [SCROLL_DISPATCHER_PROVIDER],
})
export class ScrollDispatchModule { }
