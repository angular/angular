/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview
 * While Angular only uses Trusted Types internally for the time being,
 * references to Trusted Types could leak into our core.d.ts, which would force
 * anyone compiling against @angular/core to provide the @types/trusted-types
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
 * but restricted to the API surface used within Angular.
 */

export declare interface TrustedHTML {
  __brand__: 'TrustedHTML';
}
export declare interface TrustedScript {
  __brand__: 'TrustedScript';
}
export declare interface TrustedScriptURL {
  __brand__: 'TrustedScriptURL';
}

export declare interface TrustedTypePolicyFactory {
  createPolicy(policyName: string, policyOptions: {
    createHTML?: (input: string) => string,
    createScript?: (input: string) => string,
    createScriptURL?: (input: string) => string,
  }): TrustedTypePolicy;
  getAttributeType(tagName: string, attribute: string): string|null;
}

export declare interface TrustedTypePolicy {
  createHTML(input: string): TrustedHTML;
  createScript(input: string): TrustedScript;
  createScriptURL(input: string): TrustedScriptURL;
}
