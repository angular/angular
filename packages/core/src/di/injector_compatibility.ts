/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import '../util/ng_dev_mode';

import {RuntimeError, RuntimeErrorCode} from '../errors';
import {Type} from '../interface/type';
import {emitInjectEvent} from '../render3/debug/injector_profiler';
import {stringify} from '../util/stringify';

import {resolveForwardRef} from './forward_ref';
import {getInjectImplementation, injectRootLimpMode} from './inject_switch';
import type {Injector} from './injector';
import {DecoratorFlags, InternalInjectFlags, InjectOptions} from './interface/injector';
import {ProviderToken} from './provider_token';
import type {HostAttributeToken} from './host_attribute_token';
import {
  Injector as PrimitivesInjector,
  isNotFound,
  NotFound,
  InjectionToken as PrimitivesInjectionToken,
  getCurrentInjector,
} from '../../primitives/di';

import {InjectionToken} from './injection_token';

const _THROW_IF_NOT_FOUND = {};
export const THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;

export {getCurrentInjector, setCurrentInjector} from '../../primitives/di';

/*
 * Name of a property (that we patch onto DI decorator), which is used as an annotation of which
 * InjectFlag this decorator represents. This allows to avoid direct references to the DI decorators
 * in the code, thus making them tree-shakable.
 */
const DI_DECORATOR_FLAG = '__NG_DI_FLAG__';

/**
 * A wrapper around an `Injector` that implements the `PrimitivesInjector` interface.
 *
 * This is used to allow the `inject` function to be used with the new primitives-based DI system.
 */
export class RetrievingInjector implements PrimitivesInjector {
  constructor(readonly injector: Injector) {}
  retrieve<T>(token: PrimitivesInjectionToken<T>, options: unknown): T | NotFound {
    const flags: InternalInjectFlags =
      convertToBitFlags(options as InjectOptions | undefined) || InternalInjectFlags.Default;
    try {
      return (this.injector as BackwardsCompatibleInjector).get(
        token as unknown as InjectionToken<T>,
        // When a dependency is requested with an optional flag, DI returns null as the default value.
        (flags & InternalInjectFlags.Optional ? null : THROW_IF_NOT_FOUND) as T,
        flags,
      ) as T;
    } catch (e: any) {
      if (isNotFound(e)) {
        return e;
      }
      throw e;
    }
  }
}

export const NG_TEMP_TOKEN_PATH = 'ngTempTokenPath';
const NG_TOKEN_PATH = 'ngTokenPath';
const NEW_LINE = /\n/gm;
const NO_NEW_LINE = 'ɵ';
export const SOURCE = '__source';

/**
 * Temporary type to allow internal symbols to use inject flags. This should be
 * removed once we consolidate the flags and the object literal approach.
 */
export type BackwardsCompatibleInjector = Injector & {
  get<T>(
    token: ProviderToken<T>,
    notFoundValue?: T,
    options?: InternalInjectFlags | InjectOptions,
  ): T;
};

export function injectInjectorOnly<T>(token: ProviderToken<T>): T;
export function injectInjectorOnly<T>(
  token: ProviderToken<T>,
  flags?: InternalInjectFlags,
): T | null;
export function injectInjectorOnly<T>(
  token: ProviderToken<T>,
  flags = InternalInjectFlags.Default,
): T | null {
  const currentInjector = getCurrentInjector();
  if (currentInjector === undefined) {
    throw new RuntimeError(
      RuntimeErrorCode.MISSING_INJECTION_CONTEXT,
      ngDevMode &&
        `The \`${stringify(token)}\` token injection failed. \`inject()\` function must be called from an injection context such as a constructor, a factory function, a field initializer, or a function used with \`runInInjectionContext\`.`,
    );
  } else if (currentInjector === null) {
    return injectRootLimpMode(token, undefined, flags);
  } else {
    const options = convertToInjectOptions(flags);
    const value = currentInjector.retrieve(token as PrimitivesInjectionToken<T>, options) as T;
    ngDevMode && emitInjectEvent(token as Type<unknown>, value, flags);
    if (isNotFound(value)) {
      if (options.optional) {
        return null;
      }
      throw value;
    }
    return value;
  }
}

/**
 * Generated instruction: injects a token from the currently active injector.
 *
 * (Additional documentation moved to `inject`, as it is the public API, and an alias for this
 * instruction)
 *
 * @see inject
 * @codeGenApi
 * @publicApi This instruction has been emitted by ViewEngine for some time and is deployed to npm.
 */
export function ɵɵinject<T>(token: ProviderToken<T>): T;
export function ɵɵinject<T>(token: ProviderToken<T>, flags?: InternalInjectFlags): T | null;
export function ɵɵinject(token: HostAttributeToken): string;
export function ɵɵinject(token: HostAttributeToken, flags?: InternalInjectFlags): string | null;
export function ɵɵinject<T>(
  token: ProviderToken<T> | HostAttributeToken,
  flags?: InternalInjectFlags,
): string | null;
export function ɵɵinject<T>(
  token: ProviderToken<T> | HostAttributeToken,
  flags = InternalInjectFlags.Default,
): T | null {
  return (getInjectImplementation() || injectInjectorOnly)(
    resolveForwardRef(token as Type<T>),
    flags,
  );
}

/**
 * Throws an error indicating that a factory function could not be generated by the compiler for a
 * particular class.
 *
 * The name of the class is not mentioned here, but will be in the generated factory function name
 * and thus in the stack trace.
 *
 * @codeGenApi
 */
export function ɵɵinvalidFactoryDep(index: number): never {
  throw new RuntimeError(
    RuntimeErrorCode.INVALID_FACTORY_DEPENDENCY,
    ngDevMode &&
      `This constructor is not compatible with Angular Dependency Injection because its dependency at index ${index} of the parameter list is invalid.
This can happen if the dependency type is a primitive like a string or if an ancestor of this class is missing an Angular decorator.

Please check that 1) the type for the parameter at index ${index} is correct and 2) the correct Angular decorators are defined for this class and its ancestors.`,
  );
}

/**
 * @param token A token that represents a dependency that should be injected.
 * @returns the injected value if operation is successful, `null` otherwise.
 * @throws if called outside of a supported context.
 *
 * @publicApi
 */
export function inject<T>(token: ProviderToken<T>): T;
/**
 * @param token A token that represents a dependency that should be injected.
 * @param options Control how injection is executed. Options correspond to injection strategies
 *     that can be specified with parameter decorators `@Host`, `@Self`, `@SkipSelf`, and
 *     `@Optional`.
 * @returns the injected value if operation is successful.
 * @throws if called outside of a supported context, or if the token is not found.
 *
 * @publicApi
 */
export function inject<T>(token: ProviderToken<T>, options: InjectOptions & {optional?: false}): T;
/**
 * @param token A token that represents a dependency that should be injected.
 * @param options Control how injection is executed. Options correspond to injection strategies
 *     that can be specified with parameter decorators `@Host`, `@Self`, `@SkipSelf`, and
 *     `@Optional`.
 * @returns the injected value if operation is successful,  `null` if the token is not
 *     found and optional injection has been requested.
 * @throws if called outside of a supported context, or if the token is not found and optional
 *     injection was not requested.
 *
 * @publicApi
 */
export function inject<T>(token: ProviderToken<T>, options: InjectOptions): T | null;
/**
 * @param token A token that represents a static attribute on the host node that should be injected.
 * @returns Value of the attribute if it exists.
 * @throws If called outside of a supported context or the attribute does not exist.
 *
 * @publicApi
 */
export function inject(token: HostAttributeToken): string;
/**
 * @param token A token that represents a static attribute on the host node that should be injected.
 * @returns Value of the attribute if it exists, otherwise `null`.
 * @throws If called outside of a supported context.
 *
 * @publicApi
 */
export function inject(token: HostAttributeToken, options: {optional: true}): string | null;
/**
 * @param token A token that represents a static attribute on the host node that should be injected.
 * @returns Value of the attribute if it exists.
 * @throws If called outside of a supported context or the attribute does not exist.
 *
 * @publicApi
 */
export function inject(token: HostAttributeToken, options: {optional: false}): string;
/**
 * Injects a token from the currently active injector.
 * `inject` is only supported in an [injection context](guide/di/dependency-injection-context). It
 * can be used during:
 * - Construction (via the `constructor`) of a class being instantiated by the DI system, such
 * as an `@Injectable` or `@Component`.
 * - In the initializer for fields of such classes.
 * - In the factory function specified for `useFactory` of a `Provider` or an `@Injectable`.
 * - In the `factory` function specified for an `InjectionToken`.
 * - In a stackframe of a function call in a DI context
 *
 * @param token A token that represents a dependency that should be injected.
 * @param flags Optional flags that control how injection is executed.
 * The flags correspond to injection strategies that can be specified with
 * parameter decorators `@Host`, `@Self`, `@SkipSelf`, and `@Optional`.
 * @returns the injected value if operation is successful, `null` otherwise.
 * @throws if called outside of a supported context.
 *
 * @usageNotes
 * In practice the `inject()` calls are allowed in a constructor, a constructor parameter and a
 * field initializer:
 *
 * ```ts
 * @Injectable({providedIn: 'root'})
 * export class Car {
 *   radio: Radio|undefined;
 *   // OK: field initializer
 *   spareTyre = inject(Tyre);
 *
 *   constructor() {
 *     // OK: constructor body
 *     this.radio = inject(Radio);
 *   }
 * }
 * ```
 *
 * It is also legal to call `inject` from a provider's factory:
 *
 * ```ts
 * providers: [
 *   {provide: Car, useFactory: () => {
 *     // OK: a class factory
 *     const engine = inject(Engine);
 *     return new Car(engine);
 *   }}
 * ]
 * ```
 *
 * Calls to the `inject()` function outside of the class creation context will result in error. Most
 * notably, calls to `inject()` are disallowed after a class instance was created, in methods
 * (including lifecycle hooks):
 *
 * ```ts
 * @Component({ ... })
 * export class CarComponent {
 *   ngOnInit() {
 *     // ERROR: too late, the component instance was already created
 *     const engine = inject(Engine);
 *     engine.start();
 *   }
 * }
 * ```
 *
 * @publicApi
 */
export function inject<T>(token: ProviderToken<T> | HostAttributeToken, options?: InjectOptions) {
  // The `as any` here _shouldn't_ be necessary, but without it JSCompiler
  // throws a disambiguation  error due to the multiple signatures.
  return ɵɵinject(token as any, convertToBitFlags(options));
}

// Converts object-based DI flags (`InjectOptions`) to bit flags (`InjectFlags`).
export function convertToBitFlags(
  flags: InjectOptions | InternalInjectFlags | undefined,
): InternalInjectFlags | undefined {
  if (typeof flags === 'undefined' || typeof flags === 'number') {
    return flags;
  }

  // While TypeScript doesn't accept it without a cast, bitwise OR with false-y values in
  // JavaScript is a no-op. We can use that for a very codesize-efficient conversion from
  // `InjectOptions` to `InjectFlags`.
  return (InternalInjectFlags.Default | // comment to force a line break in the formatter
    ((flags.optional && InternalInjectFlags.Optional) as number) |
    ((flags.host && InternalInjectFlags.Host) as number) |
    ((flags.self && InternalInjectFlags.Self) as number) |
    ((flags.skipSelf && InternalInjectFlags.SkipSelf) as number)) as InternalInjectFlags;
}

// Converts bitflags to inject options
function convertToInjectOptions(flags: InternalInjectFlags): InjectOptions {
  return {
    optional: !!(flags & InternalInjectFlags.Optional),
    host: !!(flags & InternalInjectFlags.Host),
    self: !!(flags & InternalInjectFlags.Self),
    skipSelf: !!(flags & InternalInjectFlags.SkipSelf),
  };
}

export function injectArgs(types: (ProviderToken<any> | any[])[]): any[] {
  const args: any[] = [];
  for (let i = 0; i < types.length; i++) {
    const arg = resolveForwardRef(types[i]);
    if (Array.isArray(arg)) {
      if (arg.length === 0) {
        throw new RuntimeError(
          RuntimeErrorCode.INVALID_DIFFER_INPUT,
          ngDevMode && 'Arguments array must have arguments.',
        );
      }
      let type: Type<any> | undefined = undefined;
      let flags: InternalInjectFlags = InternalInjectFlags.Default;

      for (let j = 0; j < arg.length; j++) {
        const meta = arg[j];
        const flag = getInjectFlag(meta);
        if (typeof flag === 'number') {
          // Special case when we handle @Inject decorator.
          if (flag === DecoratorFlags.Inject) {
            type = meta.token;
          } else {
            flags |= flag;
          }
        } else {
          type = meta;
        }
      }

      args.push(ɵɵinject(type!, flags));
    } else {
      args.push(ɵɵinject(arg));
    }
  }
  return args;
}

/**
 * Attaches a given InjectFlag to a given decorator using monkey-patching.
 * Since DI decorators can be used in providers `deps` array (when provider is configured using
 * `useFactory`) without initialization (e.g. `Host`) and as an instance (e.g. `new Host()`), we
 * attach the flag to make it available both as a static property and as a field on decorator
 * instance.
 *
 * @param decorator Provided DI decorator.
 * @param flag InjectFlag that should be applied.
 */
export function attachInjectFlag(decorator: any, flag: InternalInjectFlags | DecoratorFlags): any {
  decorator[DI_DECORATOR_FLAG] = flag;
  decorator.prototype[DI_DECORATOR_FLAG] = flag;
  return decorator;
}

/**
 * Reads monkey-patched property that contains InjectFlag attached to a decorator.
 *
 * @param token Token that may contain monkey-patched DI flags property.
 */
export function getInjectFlag(token: any): number | undefined {
  return token[DI_DECORATOR_FLAG];
}

export function catchInjectorError(
  e: any,
  token: any,
  injectorErrorName: string,
  source: string | null,
): never {
  const tokenPath: any[] = e[NG_TEMP_TOKEN_PATH];
  if (token[SOURCE]) {
    tokenPath.unshift(token[SOURCE]);
  }
  e.message = formatError('\n' + e.message, tokenPath, injectorErrorName, source);
  e[NG_TOKEN_PATH] = tokenPath;
  e[NG_TEMP_TOKEN_PATH] = null;
  throw e;
}

export function formatError(
  text: string,
  obj: any,
  injectorErrorName: string,
  source: string | null = null,
): string {
  text = text && text.charAt(0) === '\n' && text.charAt(1) == NO_NEW_LINE ? text.slice(2) : text;
  let context = stringify(obj);
  if (Array.isArray(obj)) {
    context = obj.map(stringify).join(' -> ');
  } else if (typeof obj === 'object') {
    let parts = <string[]>[];
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        let value = obj[key];
        parts.push(
          key + ':' + (typeof value === 'string' ? JSON.stringify(value) : stringify(value)),
        );
      }
    }
    context = `{${parts.join(', ')}}`;
  }
  return `${injectorErrorName}${source ? '(' + source + ')' : ''}[${context}]: ${text.replace(
    NEW_LINE,
    '\n  ',
  )}`;
}
