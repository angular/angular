/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {
  getMessageForClassIncompatibility,
  getMessageForInputIncompatibility,
} from './input_detection/incompatibility_human';
export {type KnownInputInfo, KnownInputs} from './input_detection/known_inputs';
export {
  type InputNameNode,
  type InputNode,
  isInputContainerNode,
} from './input_detection/input_node';
export {
  type InputDescriptor,
  type InputUniqueKey,
  getInputDescriptor,
  isInputDescriptor,
} from './utils/input_id';
export {SignalInputMigration} from './migration';
export {type MigrationConfig} from './migration_config';
