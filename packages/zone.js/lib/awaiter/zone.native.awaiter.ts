/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Zone.__load_patch('native.awaiter', () => {
  Zone.__awaiter =
      async function<T>(thisArg: any, _arguments: any, generator: () => Generator<T|Promise<T>>) {
    const zone = Zone.current;
    const gen = generator.apply(thisArg, _arguments);
    let res: IteratorResult<T|Promise<T>>|null = null;
    const args: (T|undefined)[] = [undefined];
    while (!res || !res.done) {
      try {
        res = zone === Zone.current ? gen.next() : zone.run(gen.next, gen, args, 'native await');
        args[0] = res!.done ? res!.value : await res!.value;
      } catch (error) {
        zone.runGuarded(() => {
          res = gen.throw(error);
        }, undefined, [], 'native await');
      }
    }
    return args[0]!;
  };
});
