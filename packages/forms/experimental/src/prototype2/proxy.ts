const PROPERTIES = Symbol('PROPERTIES');

export function createOnAccessProxy<B, W>(
  backing: B,
  wrap: (backing: B, property: PropertyKey) => W,
): W {
  return new Proxy(
    {...backing, [PROPERTIES]: {} as Record<keyof B, W>},
    {
      get(target, key) {
        const property = key as keyof B;
        if (target.hasOwnProperty(property)) {
          return target[property];
        }
        let wrappedChild = target[PROPERTIES][property] ?? wrap(backing[property] as B, property);
        target[PROPERTIES][property] = wrappedChild;
        return wrappedChild;
      },
      has(target, key) {
        return target[PROPERTIES].hasOwnProperty(key);
      },
      ownKeys(target) {
        return Reflect.ownKeys(target[PROPERTIES]);
      },
    },
  ) as W;
}
