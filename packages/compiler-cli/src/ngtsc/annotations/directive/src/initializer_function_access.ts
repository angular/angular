/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ErrorCode, FatalDiagnosticError, makeDiagnosticChain} from '../../../diagnostics';
import {ClassMember} from '../../../reflection';
import {classMemberAccessLevelToString} from '../../../reflection/src/util';

import {InitializerFunctionMetadata} from './initializer_functions';

/**
 * Validates that the initializer member is compatible with the given class
 * member in terms of field access and visibility.
 *
 * @throws {FatalDiagnosticError} If the recognized initializer API is
 *   incompatible.
 */
export function validateAccessOfInitializerApiMember(
  {api, call}: InitializerFunctionMetadata,
  member: Pick<ClassMember, 'accessLevel'>,
): void {
  if (!api.allowedAccessLevels.includes(member.accessLevel)) {
    throw new FatalDiagnosticError(
      ErrorCode.INITIALIZER_API_DISALLOWED_MEMBER_VISIBILITY,
      call,
      makeDiagnosticChain(
        `Cannot use "${
          api.functionName
        }" on a class member that is declared as ${classMemberAccessLevelToString(
          member.accessLevel,
        )}.`,
        [
          makeDiagnosticChain(
            `Update the class field to be either: ` +
              api.allowedAccessLevels.map((l) => classMemberAccessLevelToString(l)).join(', '),
          ),
        ],
      ),
    );
  }
}
