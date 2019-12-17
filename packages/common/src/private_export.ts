/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// TODO(misko): Delete this code after angula/flex-layout stops depending on private APIs
// We need to export this to make angular/flex-layout happy
// https://github.com/angular/flex-layout/blob/ec7b57eb6adf59ecfdfff1de5ccf1ab2f6652ed3/src/lib/extended/class/class.ts#L9
export {NgClass as ɵNgClassImpl, NgClass as ɵNgClassR2Impl} from './directives/ng_class';
export {NgStyle as ɵNgStyleR2Impl} from './directives/ng_style';

export {DomAdapter as ɵDomAdapter, getDOM as ɵgetDOM, setRootDomAdapter as ɵsetRootDomAdapter} from './dom_adapter';
export {BrowserPlatformLocation as ɵBrowserPlatformLocation} from './location/platform_location';