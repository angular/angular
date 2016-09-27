/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS} from './platform_providers';
import * as resource_loader from './resource_loader/resource_loader_impl';

export var __platform_browser_dynamic_private__: {
  INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS: typeof INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS,
  _ResourceLoaderImpl?: resource_loader.ResourceLoaderImpl,
  ResourceLoaderImpl: typeof resource_loader.ResourceLoaderImpl
} = {
  INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS: INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS,
  ResourceLoaderImpl: resource_loader.ResourceLoaderImpl
};
