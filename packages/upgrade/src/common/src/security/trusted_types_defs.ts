/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @fileoverview
 * While Angular only uses Trusted Types internally for the time being,
 * references to Trusted Types could leak into our public API, which would force
 * anyone compiling against @angular/upgrade to provide the @types/trusted-types
 * package in their compilation unit.
 *
 * Until https://github.com/microsoft/TypeScript/issues/30024 is resolved, we
 * will keep Angular's public API surface free of references to Trusted Types.
 * For internal and semi-private APIs that need to reference Trusted Types, the
 * minimal type definitions for the Trusted Types API provided by this module
 * should be used instead. They are marked as "declare" to prevent them from
 * being renamed by compiler optimization.
 *
 * Adapted from
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/trusted-types/index.d.ts
 * but restricted to the API surface used within Angular, mimicking the approach
 * in packages/core/src/util/security/trusted_type_defs.ts.
 */

export type TrustedHTML = string & {
  __brand__: 'TrustedHTML';
};

export interface TrustedTypePolicyFactory {
  createPolicy(
    policyName: string,
    policyOptions: {createHTML?: (input: string) => string},
  ): TrustedTypePolicy;
}

export interface TrustedTypePolicy {
  createHTML(input: string): TrustedHTML;
}
