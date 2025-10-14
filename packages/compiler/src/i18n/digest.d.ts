/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as i18n from './i18n_ast';
/**
 * Return the message id or compute it using the XLIFF1 digest.
 */
export declare function digest(message: i18n.Message): string;
/**
 * Compute the message id using the XLIFF1 digest.
 */
export declare function computeDigest(message: i18n.Message): string;
/**
 * Return the message id or compute it using the XLIFF2/XMB/$localize digest.
 */
export declare function decimalDigest(message: i18n.Message): string;
/**
 * Compute the message id using the XLIFF2/XMB/$localize digest.
 */
export declare function computeDecimalDigest(message: i18n.Message): string;
export declare function serializeNodes(nodes: i18n.Node[]): string[];
/**
 * Compute the SHA1 of the given string
 *
 * see https://csrc.nist.gov/publications/fips/fips180-4/fips-180-4.pdf
 *
 * WARNING: this function has not been designed not tested with security in mind.
 *          DO NOT USE IT IN A SECURITY SENSITIVE CONTEXT.
 */
export declare function sha1(str: string): string;
/**
 * Compute the fingerprint of the given string
 *
 * The output is 64 bit number encoded as a decimal string
 *
 * based on:
 * https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/GoogleJsMessageIdGenerator.java
 */
export declare function fingerprint(str: string): bigint;
export declare function computeMsgId(msg: string, meaning?: string): string;
