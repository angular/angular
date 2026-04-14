/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Type} from '../interface/type';
import {makeDecorator, TypeDecorator} from '../util/decorators';
import {compileService} from './jit/service';

/**
 * Type of the Service decorator / constructor function.
 *
 * @publicApi
 */
export interface ServiceDecorator {
  /**
   * Decorator that marks a class as a service and makes it automatically available
   * in the dependency injection system.
   *
   * @see [Introduction to Services and DI](guide/di)
   * @see [Creating and using services](guide/di/creating-and-using-services)
   * @see [Defining dependency providers](guide/di/defining-dependency-providers)
   *
   * @developerPreview 22.0
   */
  (): TypeDecorator;

  /**
   * When `autoProvided` is set to `false`, the service won't be exposed to the dependency
   * injection system automatically. It is up to the user to expose it in a providers list.
   *
   * @developerPreview 22.0
   */
  (options?: {autoProvided: false}): TypeDecorator;

  /**
   * Creates a service that is automatically provided. Passing an optional
   * `factory` allows for the runtime value to be replaced.
   *
   * @developerPreview 22.0
   */
  (options?: {autoProvided?: true; factory?: () => unknown}): TypeDecorator;
}

/**
 * Type of the Service metadata.
 *
 * @publicApi
 * @developerPreview 22.0
 */
export interface Service {
  /**
   * Determines whether the service should be provided automatically or by the user.
   * Defaults to `true`.
   */
  autoProvided?: boolean;

  /**
   * A function to invoke to create a value for this service.
   */
  factory?: () => unknown;
}

/**
 * Service decorator and metadata.
 *
 * @Annotation
 * @publicApi
 * @developerPreview 22.0
 */
export const Service: ServiceDecorator = makeDecorator(
  'Service',
  undefined,
  undefined,
  undefined,
  (type: Type<unknown>, meta: Service | undefined) => compileService(type, meta),
);
