/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {PlatformState} from './platform_state';
export {platformDynamicServer, platformServer, ServerModule} from './server';
export {BEFORE_APP_SERIALIZED, INITIAL_CONFIG, PlatformConfig} from './tokens';
export {ServerTransferStateModule} from './transfer_state';
export {renderModule, renderModuleFactory} from './utils';

export * from './private_export';
export {VERSION} from './version';
