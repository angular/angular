/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export {type KnownInputInfo, KnownInputs} from './input_detection/known_inputs';
export {
  type InputNameNode,
  type InputNode,
  isInputContainerNode,
} from './input_detection/input_node';
export {type ClassFieldDescriptor} from './passes/reference_resolution/known_fields';
export {type InputDescriptor, getInputDescriptor, isInputDescriptor} from './utils/input_id';
export {SignalInputMigration} from './migration';
export {type MigrationConfig} from './migration_config';
export {
  type FieldIncompatibility,
  FieldIncompatibilityReason,
  ClassIncompatibilityReason,
  nonIgnorableFieldIncompatibilities,
} from './passes/problematic_patterns/incompatibility';
export {
  getMessageForClassIncompatibility,
  getMessageForFieldIncompatibility,
} from './passes/problematic_patterns/incompatibility_human';
