export const PROXY_TREE = Symbol('PROXY_TREE');

export type ProxyTreeMeta<T, B extends Object, W> = {
  [PROXY_TREE]: {
    backing: B;
    parent: ProxyWrapped<unknown, B, W> | undefined;
    propertyInParent: PropertyKey | undefined;
    properties: Record<keyof T, ProxyWrapped<T[keyof T], B, W>>;
  };
};

export type ProxyWrapped<T, B extends Object, W> = W &
  ProxyTreeMeta<T, B, W> &
  (T extends Record<PropertyKey, unknown>
    ? { readonly [K in keyof T]: ProxyWrapped<T[K], B, W> }
    : T extends readonly unknown[]
      ? readonly ProxyWrapped<T[number], B, W>[]
      : {});

export function createOnAccessProxy<T, B extends Object, W>(
  backing: B,
  callbacks: {
    wrap: (backing: B, parent?: ProxyWrapped<unknown, B, W>, propertyInParent?: PropertyKey) => W;
    descend?: (backing: B, property: keyof T) => unknown;
    configure?: (
      wrapped: ProxyWrapped<T, B, W>,
      backing: B,
      parent?: ProxyWrapped<unknown, B, W>,
      propertyInParent?: PropertyKey,
    ) => void;
  },
  parent?: ProxyWrapped<unknown, B, W>,
  propertyInParent?: PropertyKey,
): ProxyWrapped<T, B, W> {
  const { wrap, descend, configure } = {
    descend: (backing: B, property: keyof B) => backing[property],
    configure: () => {},
    ...callbacks,
  };
  const wrapped = new Proxy(
    {
      ...wrap(backing, parent, propertyInParent),
      [PROXY_TREE]: { backing, parent, propertyInParent, properties: {} },
    } as W & ProxyTreeMeta<T, B, W>,
    {
      get(target, key, receiver) {
        if (target.hasOwnProperty(key)) {
          return Reflect.get(target, key, receiver);
        }
        const property = key as keyof T;
        const backingChild = descend(backing, property as never);
        const wrappedChild =
          target[PROXY_TREE].properties[property] ??
          createOnAccessProxy(backingChild as unknown as B, callbacks, wrapped, property);
        target[PROXY_TREE].properties[property] = wrappedChild;
        return wrappedChild;
      },
      ownKeys(target) {
        return Reflect.ownKeys(target[PROXY_TREE].properties);
      },
    },
  ) as ProxyWrapped<T, B, W>;
  configure(wrapped, backing, parent, propertyInParent);
  return wrapped;
}
