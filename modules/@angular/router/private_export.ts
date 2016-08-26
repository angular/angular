/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ClassProvider, ExistingProvider, FactoryProvider, Provider, TypeProvider, ValueProvider} from '@angular/core';
import {OpaqueToken} from '@angular/core'

import {ROUTES} from './src/router_config_loader';
import {ROUTER_PROVIDERS} from './src/router_module';

export interface __router_private_types__ {
  ROUTER_PROVIDERS: any[];
  ROUTES: OpaqueToken;
}

export var __router_private__ = {
  ROUTER_PROVIDERS: ROUTER_PROVIDERS,
  ROUTES: ROUTES
};
