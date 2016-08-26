import {downlevelDeclaration} from '@angular/tsc-wrapped/src/dts_downleveler';
import * as ts from 'typescript';


describe('downlevelDeclaration', () => {
  it('should remove "readonly" from classes', () => {
    expect(downlevel(`
export declare class Foo {
    readonly bar: string;
}
`)).toEqual(`
export declare class Foo {
    bar: string;
}
`);
  });

  it('should remove "readonly" from interfaces', () => {
    expect(downlevel(`
export interface Foo {
    readonly bar: string;
}
`)).toEqual(`
export interface Foo {
    bar: string;
}
`);
  });

  it('should remove "readonly" from type literals', () => {
    expect(downlevel(`
export declare function foo(): {
    readonly ro: string;
};
`)).toEqual(`
export declare function foo(): {
    ro: string;
};
`);
  });

  it('should remove "abstract" from class properties', () => {
    expect(downlevel(`
export declare class Foo {
    abstract bar: string;
}
`)).toEqual(`
export declare class Foo {
    bar: string;
}
`);
  });

  it('should not remove "abstract" from class instance methods', () => {
    expect(downlevel(`
export declare class Foo {
    abstract bar(): string;
}
`)).toEqual(`
export declare class Foo {
    abstract bar(): string;
}
`);
  });

  it('should remove "?" from class properties', () => {
    expect(downlevel(`
export declare class Foo {
    bar?: string;
}
`)).toEqual(`
export declare class Foo {
    bar: string;
}
`);
  });

  it('should remove "?" from class instance or static methods', () => {
    expect(downlevel(`
export declare class Foo {
    bar?(): string;
    static baz?(): string;
}
`)).toEqual(`
export declare class Foo {
    bar?(): string;
    static baz?(): string;
}
`);
  });

  it('should not remove "?" from interface properties', () => {
    expect(downlevel(`
export interface Foo {
    bar?: string;
}
`)).toEqual(`
export interface Foo {
    bar?: string;
}
`);
  });

  it('should not remove "?" from type literals', () => {
    expect(downlevel(`
export interface Foo {
    bar?: string;
}
`)).toEqual(`
export interface Foo {
    bar?: string;
}
`);
  });
});

function downlevel(text: string) {
  return downlevelDeclaration('foo.d.ts', text, ts.ScriptTarget.ES2015);
}
