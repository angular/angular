/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NgModule} from '@angular/core';
import {PlatformModule} from '@angular/cdk/platform';
import {BreakpointObserver} from './breakpoints-observer';
import {MediaMatcher} from './media-matcher';

@NgModule({
  providers: [BreakpointObserver, MediaMatcher],
  imports: [PlatformModule],
})
export class LayoutModule {}

export {BreakpointObserver, BreakpointState} from './breakpoints-observer';
export {Breakpoints} from './breakpoints';
export {MediaMatcher} from './media-matcher';
