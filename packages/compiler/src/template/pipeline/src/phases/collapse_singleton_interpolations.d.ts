/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { CompilationJob } from '../compilation';
/**
 * Attribute or style interpolations of the form `[attr.foo]="{{foo}}""` should be "collapsed"
 * into a plain instruction, instead of an interpolated one.
 *
 * (We cannot do this for singleton property interpolations,
 * because they need to stringify their expressions)
 *
 * The reification step is also capable of performing this transformation, but doing it early in the
 * pipeline allows other phases to accurately know what instruction will be emitted.
 */
export declare function collapseSingletonInterpolations(job: CompilationJob): void;
