/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../type';
import {stringify} from '../util';

import {InjectableDef, defineInjectable} from './defs';
import {resolveForwardRef} from './forward_ref';
import {InjectionToken} from './injection_token';
import {Inject, Optional, Self, SkipSelf} from './metadata';
import {ConstructorProvider, ExistingProvider, FactoryProvider, StaticClassProvider, StaticProvider, ValueProvider} from './provider';

export const SOURCE = '__source';
const _THROW_IF_NOT_FOUND = new Object();
export const THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;

/**
 * An InjectionToken that gets the current `Injector` for `createInjector()`-style injectors.
 *
 * Requesting this token instead of `Injector` allows `StaticInjector` to be tree-shaken from a
 * project.
 *
 * @experimental
 */
export const INJECTOR = new InjectionToken<Injector>('INJECTOR');

export class NullInjector implements Injector {
  get(token: any, notFoundValue: any = _THROW_IF_NOT_FOUND): any {
    if (notFoundValue === _THROW_IF_NOT_FOUND) {
      // Intentionally left behind: With dev tools open the debugger will stop here. There is no
      // reason why correctly written application should cause this exception.
      // TODO(misko): uncomment the next line once `ngDevMode` works with closure.
      // if(ngDevMode) debugger;
      throw new Error(`NullInjectorError: No provider for ${stringify(token)}!`);
    }
    return notFoundValue;
  }
}

/**
 * Concrete injectors implement this interface.
 *
 * For more details, see the ["Dependency Injection Guide"](guide/dependency-injection).
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/di/ts/injector_spec.ts region='Injector'}
 *
 * `Injector` returns itself when given `Injector` as a token:
 *
 * {@example core/di/ts/injector_spec.ts region='injectInjector'}
 *
 *
 */
export abstract class Injector {
  static THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;
  static NULL: Injector = new NullInjector();

  /**
   * Retrieves an instance from the injector based on the provided token.
   * @returns The instance from the injector if defined, otherwise the `notFoundValue`.
   * @throws When the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.
   */
  abstract get<T>(token: Type<T>|InjectionToken<T>, notFoundValue?: T, flags?: InjectFlags): T;
  /**
   * @deprecated from v4.0.0 use Type<T> or InjectionToken<T>
   * @suppress {duplicate}
   */
  abstract get(token: any, notFoundValue?: any): any;

  /**
   * @deprecated from v5 use the new signature Injector.create(options)
   */
  static create(providers: StaticProvider[], parent?: Injector): Injector;

  static create(options: {providers: StaticProvider[], parent?: Injector, name?: string}): Injector;

  /**
   * Create a new Injector which is configure using `StaticProvider`s.
   *
   * @usageNotes
   * ### Example
   *
   * {@example core/di/ts/provider_spec.ts region='ConstructorProvider'}
   */
  static create(
      options: StaticProvider[]|{providers: StaticProvider[], parent?: Injector, name?: string},
      parent?: Injector): Injector {
    if (Array.isArray(options)) {
      return new StaticInjector(options, parent);
    } else {
      return new StaticInjector(options.providers, options.parent, options.name || null);
    }
  }

  static ngInjectableDef = defineInjectable({
    providedIn: 'any' as any,
    factory: () => inject(INJECTOR),
  });
}



const IDENT = function<T>(value: T): T {
  return value;
};
const EMPTY = <any[]>[];
const CIRCULAR = IDENT;
const MULTI_PROVIDER_FN = function(): any[] {
  return Array.prototype.slice.call(arguments);
};
const GET_PROPERTY_NAME = {} as any;
export const USE_VALUE =
    getClosureSafeProperty<ValueProvider>({provide: String, useValue: GET_PROPERTY_NAME});
const NG_TOKEN_PATH = 'ngTokenPath';
const NG_TEMP_TOKEN_PATH = 'ngTempTokenPath';
const enum OptionFlags {
  Optional = 1 << 0,
  CheckSelf = 1 << 1,
  CheckParent = 1 << 2,
  Default = CheckSelf | CheckParent
}
const NULL_INJECTOR = Injector.NULL;
const NEW_LINE = /\n/gm;
const NO_NEW_LINE = 'ɵ';

export class StaticInjector implements Injector {
  readonly parent: Injector;
  readonly source: string|null;

  private _records: Map<any, Record>;

  constructor(
      providers: StaticProvider[], parent: Injector = NULL_INJECTOR, source: string|null = null) {
    this.parent = parent;
    this.source = source;
    const records = this._records = new Map<any, Record>();
    records.set(
        Injector, <Record>{token: Injector, fn: IDENT, deps: EMPTY, value: this, useNew: false});
    records.set(
        INJECTOR, <Record>{token: INJECTOR, fn: IDENT, deps: EMPTY, value: this, useNew: false});
    recursivelyProcessProviders(records, providers);
  }

  get<T>(token: Type<T>|InjectionToken<T>, notFoundValue?: T, flags?: InjectFlags): T;
  get(token: any, notFoundValue?: any): any;
  get(token: any, notFoundValue?: any, flags: InjectFlags = InjectFlags.Default): any {
    const record = this._records.get(token);
    try {
      return tryResolveToken(token, record, this._records, this.parent, notFoundValue, flags);
    } catch (e) {
      const tokenPath: any[] = e[NG_TEMP_TOKEN_PATH];
      if (token[SOURCE]) {
        tokenPath.unshift(token[SOURCE]);
      }
      e.message = formatError('\n' + e.message, tokenPath, this.source);
      e[NG_TOKEN_PATH] = tokenPath;
      e[NG_TEMP_TOKEN_PATH] = null;
      throw e;
    }
  }

  toString() {
    const tokens = <string[]>[], records = this._records;
    records.forEach((v, token) => tokens.push(stringify(token)));
    return `StaticInjector[${tokens.join(', ')}]`;
  }
}

type SupportedProvider =
    ValueProvider | ExistingProvider | StaticClassProvider | ConstructorProvider | FactoryProvider;

interface Record {
  fn: Function;
  useNew: boolean;
  deps: DependencyRecord[];
  value: any;
}

interface DependencyRecord {
  token: any;
  options: number;
}

type TokenPath = Array<any>;

function resolveProvider(provider: SupportedProvider): Record {
  const deps = computeDeps(provider);
  let fn: Function = IDENT;
  let value: any = EMPTY;
  let useNew: boolean = false;
  let provide = resolveForwardRef(provider.provide);
  if (USE_VALUE in provider) {
    // We need to use USE_VALUE in provider since provider.useValue could be defined as undefined.
    value = (provider as ValueProvider).useValue;
  } else if ((provider as FactoryProvider).useFactory) {
    fn = (provider as FactoryProvider).useFactory;
  } else if ((provider as ExistingProvider).useExisting) {
    // Just use IDENT
  } else if ((provider as StaticClassProvider).useClass) {
    useNew = true;
    fn = resolveForwardRef((provider as StaticClassProvider).useClass);
  } else if (typeof provide == 'function') {
    useNew = true;
    fn = provide;
  } else {
    throw staticError(
        'StaticProvider does not have [useValue|useFactory|useExisting|useClass] or [provide] is not newable',
        provider);
  }
  return {deps, fn, useNew, value};
}

function multiProviderMixError(token: any) {
  return staticError('Cannot mix multi providers and regular providers', token);
}

function recursivelyProcessProviders(records: Map<any, Record>, provider: StaticProvider) {
  if (provider) {
    provider = resolveForwardRef(provider);
    if (provider instanceof Array) {
      // if we have an array recurse into the array
      for (let i = 0; i < provider.length; i++) {
        recursivelyProcessProviders(records, provider[i]);
      }
    } else if (typeof provider === 'function') {
      // Functions were supported in ReflectiveInjector, but are not here. For safety give useful
      // error messages
      throw staticError('Function/Class not supported', provider);
    } else if (provider && typeof provider === 'object' && provider.provide) {
      // At this point we have what looks like a provider: {provide: ?, ....}
      let token = resolveForwardRef(provider.provide);
      const resolvedProvider = resolveProvider(provider);
      if (provider.multi === true) {
        // This is a multi provider.
        let multiProvider: Record|undefined = records.get(token);
        if (multiProvider) {
          if (multiProvider.fn !== MULTI_PROVIDER_FN) {
            throw multiProviderMixError(token);
          }
        } else {
          // Create a placeholder factory which will look up the constituents of the multi provider.
          records.set(token, multiProvider = <Record>{
            token: provider.provide,
            deps: [],
            useNew: false,
            fn: MULTI_PROVIDER_FN,
            value: EMPTY
          });
        }
        // Treat the provider as the token.
        token = provider;
        multiProvider.deps.push({token, options: OptionFlags.Default});
      }
      const record = records.get(token);
      if (record && record.fn == MULTI_PROVIDER_FN) {
        throw multiProviderMixError(token);
      }
      records.set(token, resolvedProvider);
    } else {
      throw staticError('Unexpected provider', provider);
    }
  }
}

function tryResolveToken(
    token: any, record: Record | undefined, records: Map<any, Record>, parent: Injector,
    notFoundValue: any, flags: InjectFlags): any {
  try {
    return resolveToken(token, record, records, parent, notFoundValue, flags);
  } catch (e) {
    // ensure that 'e' is of type Error.
    if (!(e instanceof Error)) {
      e = new Error(e);
    }
    const path: any[] = e[NG_TEMP_TOKEN_PATH] = e[NG_TEMP_TOKEN_PATH] || [];
    path.unshift(token);
    if (record && record.value == CIRCULAR) {
      // Reset the Circular flag.
      record.value = EMPTY;
    }
    throw e;
  }
}

function resolveToken(
    token: any, record: Record | undefined, records: Map<any, Record>, parent: Injector,
    notFoundValue: any, flags: InjectFlags): any {
  let value;
  if (record && !(flags & InjectFlags.SkipSelf)) {
    // If we don't have a record, this implies that we don't own the provider hence don't know how
    // to resolve it.
    value = record.value;
    if (value == CIRCULAR) {
      throw Error(NO_NEW_LINE + 'Circular dependency');
    } else if (value === EMPTY) {
      record.value = CIRCULAR;
      let obj = undefined;
      let useNew = record.useNew;
      let fn = record.fn;
      let depRecords = record.deps;
      let deps = EMPTY;
      if (depRecords.length) {
        deps = [];
        for (let i = 0; i < depRecords.length; i++) {
          const depRecord: DependencyRecord = depRecords[i];
          const options = depRecord.options;
          const childRecord =
              options & OptionFlags.CheckSelf ? records.get(depRecord.token) : undefined;
          deps.push(tryResolveToken(
              // Current Token to resolve
              depRecord.token,
              // A record which describes how to resolve the token.
              // If undefined, this means we don't have such a record
              childRecord,
              // Other records we know about.
              records,
              // If we don't know how to resolve dependency and we should not check parent for it,
              // than pass in Null injector.
              !childRecord && !(options & OptionFlags.CheckParent) ? NULL_INJECTOR : parent,
              options & OptionFlags.Optional ? null : Injector.THROW_IF_NOT_FOUND,
              InjectFlags.Default));
        }
      }
      record.value = value = useNew ? new (fn as any)(...deps) : fn.apply(obj, deps);
    }
  } else if (!(flags & InjectFlags.Self)) {
    value = parent.get(token, notFoundValue, InjectFlags.Default);
  }
  return value;
}


function computeDeps(provider: StaticProvider): DependencyRecord[] {
  let deps: DependencyRecord[] = EMPTY;
  const providerDeps: any[] =
      (provider as ExistingProvider & StaticClassProvider & ConstructorProvider).deps;
  if (providerDeps && providerDeps.length) {
    deps = [];
    for (let i = 0; i < providerDeps.length; i++) {
      let options = OptionFlags.Default;
      let token = resolveForwardRef(providerDeps[i]);
      if (token instanceof Array) {
        for (let j = 0, annotations = token; j < annotations.length; j++) {
          const annotation = annotations[j];
          if (annotation instanceof Optional || annotation == Optional) {
            options = options | OptionFlags.Optional;
          } else if (annotation instanceof SkipSelf || annotation == SkipSelf) {
            options = options & ~OptionFlags.CheckSelf;
          } else if (annotation instanceof Self || annotation == Self) {
            options = options & ~OptionFlags.CheckParent;
          } else if (annotation instanceof Inject) {
            token = (annotation as Inject).token;
          } else {
            token = resolveForwardRef(annotation);
          }
        }
      }
      deps.push({token, options});
    }
  } else if ((provider as ExistingProvider).useExisting) {
    const token = resolveForwardRef((provider as ExistingProvider).useExisting);
    deps = [{token, options: OptionFlags.Default}];
  } else if (!providerDeps && !(USE_VALUE in provider)) {
    // useValue & useExisting are the only ones which are exempt from deps all others need it.
    throw staticError('\'deps\' required', provider);
  }
  return deps;
}

function formatError(text: string, obj: any, source: string | null = null): string {
  text = text && text.charAt(0) === '\n' && text.charAt(1) == NO_NEW_LINE ? text.substr(2) : text;
  let context = stringify(obj);
  if (obj instanceof Array) {
    context = obj.map(stringify).join(' -> ');
  } else if (typeof obj === 'object') {
    let parts = <string[]>[];
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        let value = obj[key];
        parts.push(
            key + ':' + (typeof value === 'string' ? JSON.stringify(value) : stringify(value)));
      }
    }
    context = `{${parts.join(', ')}}`;
  }
  return `StaticInjectorError${source ? '(' + source + ')' : ''}[${context}]: ${text.replace(NEW_LINE, '\n  ')}`;
}

function staticError(text: string, obj: any): Error {
  return new Error(formatError(text, obj));
}

function getClosureSafeProperty<T>(objWithPropertyToExtract: T): string {
  for (let key in objWithPropertyToExtract) {
    if (objWithPropertyToExtract[key] === GET_PROPERTY_NAME) {
      return key;
    }
  }
  throw Error('!prop');
}

/**
 * Injection flags for DI.
 */
export const enum InjectFlags {
  Default = 0b0000,

  /**
   * Specifies that an injector should retrieve a dependency from any injector until reaching the
   * host element of the current component. (Only used with Element Injector)
   */
  Host = 0b0001,
  /** Don't descend into ancestors of the node requesting injection. */
  Self = 0b0010,
  /** Skip the node that is requesting injection. */
  SkipSelf = 0b0100,
  /** Inject `defaultValue` instead if token not found. */
  Optional = 0b1000,
}

/**
 * Current injector value used by `inject`.
 * - `undefined`: it is an error to call `inject`
 * - `null`: `inject` can be called but there is no injector (limp-mode).
 * - Injector instance: Use the injector for resolution.
 */
let _currentInjector: Injector|undefined|null = undefined;

export function setCurrentInjector(injector: Injector | null | undefined): Injector|undefined|null {
  const former = _currentInjector;
  _currentInjector = injector;
  return former;
}

/**
 * Injects a token from the currently active injector.
 *
 * This function must be used in the context of a factory function such as one defined for an
 * `InjectionToken`, and will throw an error if not called from such a context.
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/di/ts/injector_spec.ts region='ShakeableInjectionToken'}
 *
 * Within such a factory function `inject` is utilized to request injection of a dependency, instead
 * of providing an additional array of dependencies as was common to do with `useFactory` providers.
 * `inject` is faster and more type-safe.
 *
 * @experimental
 */
export function inject<T>(token: Type<T>| InjectionToken<T>): T;
export function inject<T>(token: Type<T>| InjectionToken<T>, flags?: InjectFlags): T|null;
export function inject<T>(token: Type<T>| InjectionToken<T>, flags = InjectFlags.Default): T|null {
  if (_currentInjector === undefined) {
    throw new Error(`inject() must be called from an injection context`);
  } else if (_currentInjector === null) {
    const injectableDef: InjectableDef<T> = (token as any).ngInjectableDef;
    if (injectableDef && injectableDef.providedIn == 'root') {
      return injectableDef.value === undefined ? injectableDef.value = injectableDef.factory() :
                                                 injectableDef.value;
    }
    if (flags & InjectFlags.Optional) return null;
    throw new Error(`Injector: NOT_FOUND [${stringify(token)}]`);
  } else {
    return _currentInjector.get(token, flags & InjectFlags.Optional ? null : undefined, flags);
  }
}

export function injectArgs(types: (Type<any>| InjectionToken<any>| any[])[]): any[] {
  const args: any[] = [];
  for (let i = 0; i < types.length; i++) {
    const arg = types[i];
    if (Array.isArray(arg)) {
      if (arg.length === 0) {
        throw new Error('Arguments array must have arguments.');
      }
      let type: Type<any>|undefined = undefined;
      let flags: InjectFlags = InjectFlags.Default;

      for (let j = 0; j < arg.length; j++) {
        const meta = arg[j];
        if (meta instanceof Optional || meta.ngMetadataName === 'Optional') {
          flags |= InjectFlags.Optional;
        } else if (meta instanceof SkipSelf || meta.ngMetadataName === 'SkipSelf') {
          flags |= InjectFlags.SkipSelf;
        } else if (meta instanceof Self || meta.ngMetadataName === 'Self') {
          flags |= InjectFlags.Self;
        } else if (meta instanceof Inject) {
          type = meta.token;
        } else {
          type = meta;
        }
      }

      args.push(inject(type !, flags));
    } else {
      args.push(inject(arg));
    }
  }
  return args;
}
