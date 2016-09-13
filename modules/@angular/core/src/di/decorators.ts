/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassMetadataCtor, EmptyParamMetadataCtor, makeDecorator, makeParamDecorator} from '../util/decorators';

import {HostMetadata, InjectMetadata, InjectMetadataCtor, InjectableMetadata, OptionalMetadata, SelfMetadata, SkipSelfMetadata} from './metadata';



/**
 * A decorator and constructor for {@link InjectMetadata}.
 *
 * @stable
 * @Annotation
 */
export const Inject: typeof InjectMetadata&InjectMetadataCtor =
    <any>makeParamDecorator(InjectMetadata);

/**
 * A decorator and constructor for {@link OptionalMetadata}.
 *
 * @stable
 * @Annotation
 */
export const Optional: typeof OptionalMetadata&EmptyParamMetadataCtor<OptionalMetadata> =
    <any>makeParamDecorator(OptionalMetadata);

/**
 * A decorator and constructor for {@link InjectableMetadata}.
 * @stable
 * @Annotation
 */
export const Injectable: typeof InjectableMetadata&ClassMetadataCtor<InjectableMetadata> =
    <any>makeDecorator(InjectableMetadata);

/**
 * A decorator and constructor for {@link SelfMetadata}.
 *
 * @stable
 * @Annotation
 */
export const Self: typeof SelfMetadata&EmptyParamMetadataCtor<SelfMetadata> =
    <any>makeParamDecorator(SelfMetadata);

/**
 * A decorator and constructor for {@link HostMetadata}.
 *
 * @stable
 * @Annotation
 */
export const Host: typeof HostMetadata&EmptyParamMetadataCtor<HostMetadata> =
    <any>makeParamDecorator(HostMetadata);

/**
 * A decorator and constructor for {@link SkipSelfMetadata}.
 *
 * @stable
 * @Annotation
 */
export const SkipSelf: typeof SkipSelfMetadata&EmptyParamMetadataCtor<SkipSelfMetadata> =
    <any>makeParamDecorator(SkipSelfMetadata);
