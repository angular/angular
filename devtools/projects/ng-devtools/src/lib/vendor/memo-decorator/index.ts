export type Resolver = (...args: any[]) => any;

export interface MapLike<K = unknown, V = unknown> {
  set(key: K, v: V): MapLike<K, V>;
  get(key: K): V;
  has(key: K): boolean;
}

export interface Config {
  resolver?: Resolver;
  cache?: MapLike;
}

function memoize(func: Function, resolver: Resolver, cache: MapLike) {
  const memoized = function() {
    const args = arguments;
    // @ts-ignore: ignore implicit any type
    const key = resolver.apply(this, args);
    const cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }

    // @ts-ignore: ignore implicit any type
    const result = func.apply(this, args);
    memoized.cache = cache.set(key, result) ?? cache;
    return result;
  };
  memoized.cache = cache;
  return memoized;
}

const defaultResolver: Resolver = (...args: any[]) => args[0];

export const memo = (config: Config = {}) =>
    (_: any, __: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
      if (typeof descriptor.value !== 'function') {
        throw new Error('Memoization can be applied only to methods');
      }

      const resolver = config.resolver ?? defaultResolver;
      const cache = config.cache ?? new Map();

      descriptor.value = memoize(descriptor.value, resolver, cache);
      return descriptor;
    };
