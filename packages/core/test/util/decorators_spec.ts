/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getReflect} from '../../src/di/jit/util';
import {ANNOTATIONS, makeDecorator, makePropDecorator} from '../../src/util/decorators';

class DecoratedParent {}
class DecoratedChild extends DecoratedParent {}

{
  const TerminalDecorator =
      makeDecorator('TerminalDecorator', (data: any) => ({terminal: true, ...data}));
  const TestDecorator = makeDecorator(
      'TestDecorator', (data: any) => data, Object, (fn: any) => fn.Terminal = TerminalDecorator);

  describe('Property decorators', () => {
    // https://github.com/angular/angular/issues/12224
    it('should work on the "watch" property', () => {
      const Prop = makePropDecorator('Prop', (value: any) => ({value}));

      class TestClass {
        @Prop('firefox!') watch: any;
      }

      const p = getReflect().propMetadata(TestClass);
      expect(p['watch']).toEqual([new Prop('firefox!')]);
    });

    it('should work with any default plain values', () => {
      const Default =
          makePropDecorator('Default', (data: any) => ({value: data != null ? data : 5}));
      expect(new Default(0)['value']).toEqual(0);
    });

    it('should work with any object values', () => {
      // make sure we don't walk up the prototype chain
      const Default = makePropDecorator('Default', (data: any) => ({value: 5, ...data}));
      const value = Object.create({value: 10});
      expect(new Default(value)['value']).toEqual(5);
    });
  });

  describe('decorators', () => {
    it('should invoke as decorator', () => {
      function Type() {}
      TestDecorator({marker: 'WORKS'})(Type);
      const annotations = (Type as any)[ANNOTATIONS];
      expect(annotations[0].marker).toEqual('WORKS');
    });

    it('should invoke as new', () => {
      const annotation = new (<any>TestDecorator)({marker: 'WORKS'});
      expect(annotation instanceof TestDecorator).toEqual(true);
      expect(annotation.marker).toEqual('WORKS');
    });

    it('should not apply decorators from the prototype chain', function() {
      TestDecorator({marker: 'parent'})(DecoratedParent);
      TestDecorator({marker: 'child'})(DecoratedChild);

      const annotations = (DecoratedChild as any)[ANNOTATIONS];
      expect(annotations.length).toBe(1);
      expect(annotations[0].marker).toEqual('child');
    });
  });
}
