/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { TrustedHTML, TrustedScript, TrustedScriptURL } from './trusted_type_defs';
/**
 * Unsafely promote a string to a TrustedHTML, falling back to strings when
 * Trusted Types are not available.
 * @security This is a security-sensitive function; any use of this function
 * must go through security review. In particular, it must be assured that it
 * is only passed strings that come directly from custom sanitizers or the
 * bypassSecurityTrust* functions.
 */
export declare function trustedHTMLFromStringBypass(html: string): TrustedHTML | string;
/**
 * Unsafely promote a string to a TrustedScript, falling back to strings when
 * Trusted Types are not available.
 * @security This is a security-sensitive function; any use of this function
 * must go through security review. In particular, it must be assured that it
 * is only passed strings that come directly from custom sanitizers or the
 * bypassSecurityTrust* functions.
 */
export declare function trustedScriptFromStringBypass(script: string): TrustedScript | string;
/**
 * Unsafely promote a string to a TrustedScriptURL, falling back to strings
 * when Trusted Types are not available.
 * @security This is a security-sensitive function; any use of this function
 * must go through security review. In particular, it must be assured that it
 * is only passed strings that come directly from custom sanitizers or the
 * bypassSecurityTrust* functions.
 */
export declare function trustedScriptURLFromStringBypass(url: string): TrustedScriptURL | string;
