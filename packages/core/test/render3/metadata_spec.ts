/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../../src/interface/type';
import {setClassMetadata} from '../../src/render3/metadata';

interface Decorator {
  type: any;
  args?: any[];
}

interface HasMetadata extends Type<any> {
  decorators?: Decorator[];
  ctorParameters: () => CtorParameter[];
  propDecorators: {[field: string]: Decorator[]};
}

interface CtorParameter {
  type: any;
  decorators?: Decorator[];
}

function metadataOf(value: Type<any>): HasMetadata {
  return value as HasMetadata;
}

describe('render3 setClassMetadata()', () => {
  it('should set decorator metadata on a type', () => {
    const Foo = metadataOf(class Foo {});
    setClassMetadata(Foo, [{type: 'test', args: ['arg']}], null, null);
    expect(Foo.decorators).toEqual([{type: 'test', args: ['arg']}]);
  });

  it('should merge decorator metadata on a type', () => {
    const Foo = metadataOf(class Foo {});
    Foo.decorators = [{type: 'first'}];
    setClassMetadata(Foo, [{type: 'test', args: ['arg']}], null, null);
    expect(Foo.decorators).toEqual([{type: 'first'}, {type: 'test', args: ['arg']}]);
  });

  it('should set ctor parameter metadata on a type', () => {
    const Foo = metadataOf(class Foo {});
    Foo.ctorParameters = () => [{type: 'initial'}];
    setClassMetadata(Foo, null, () => [{type: 'test'}], null);
    expect(Foo.ctorParameters()).toEqual([{type: 'test'}]);
  });

  it('should set parameter decorator metadata on a type', () => {
    const Foo = metadataOf(class Foo {});
    setClassMetadata(Foo, null, null, {field: [{type: 'test', args: ['arg']}]});
    expect(Foo.propDecorators).toEqual({field: [{type: 'test', args: ['arg']}]});
  });

  it('should merge parameter decorator metadata on a type', () => {
    const Foo = metadataOf(class Foo {});
    Foo.propDecorators = {initial: [{type: 'first'}]};
    setClassMetadata(Foo, null, null, {field: [{type: 'test', args: ['arg']}]});
    expect(Foo.propDecorators)
        .toEqual({field: [{type: 'test', args: ['arg']}], initial: [{type: 'first'}]});
  });
});
