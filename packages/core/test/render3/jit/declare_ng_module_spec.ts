/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  NO_ERRORS_SCHEMA,
  SchemaMetadata,
  Type,
  ɵNgModuleDef,
  ɵɵngDeclareNgModule,
} from '../../../src/core';

describe('NgModule declaration jit compilation', () => {
  it('should compile a minimal NgModule declaration', () => {
    const def = ɵɵngDeclareNgModule({type: TestClass}) as ɵNgModuleDef<TestClass>;
    expectNgModuleDef(def, {});
  });

  it('should compile an NgModule declaration with bootstrap classes', () => {
    const def = ɵɵngDeclareNgModule({
      type: TestClass,
      bootstrap: [TestComponent],
    }) as ɵNgModuleDef<TestClass>;
    expectNgModuleDef(def, {bootstrap: [TestComponent]});
  });

  it('should compile an NgModule declaration with forward referenced bootstrap classes', () => {
    const def = ɵɵngDeclareNgModule({
      type: TestClass,
      bootstrap: () => [ForwardRef],
    }) as ɵNgModuleDef<TestClass>;
    class ForwardRef {}
    expectNgModuleDef(def, {bootstrap: [ForwardRef]});
  });

  it('should compile an NgModule declaration with declarations classes', () => {
    const def = ɵɵngDeclareNgModule({
      type: TestClass,
      declarations: [TestComponent],
    }) as ɵNgModuleDef<TestClass>;
    expectNgModuleDef(def, {declarations: [TestComponent]});
  });

  it('should compile an NgModule declaration with forward referenced declarations classes', () => {
    const def = ɵɵngDeclareNgModule({
      type: TestClass,
      declarations: () => [TestComponent],
    }) as ɵNgModuleDef<TestClass>;
    expectNgModuleDef(def, {declarations: [TestComponent]});
  });

  it('should compile an NgModule declaration with imports classes', () => {
    const def = ɵɵngDeclareNgModule({
      type: TestClass,
      imports: [TestModule],
    }) as ɵNgModuleDef<TestClass>;
    expectNgModuleDef(def, {imports: [TestModule]});
  });

  it('should compile an NgModule declaration with forward referenced imports classes', () => {
    const def = ɵɵngDeclareNgModule({
      type: TestClass,
      imports: () => [TestModule],
    }) as ɵNgModuleDef<TestClass>;
    expectNgModuleDef(def, {imports: [TestModule]});
  });

  it('should compile an NgModule declaration with exports classes', () => {
    const def = ɵɵngDeclareNgModule({
      type: TestClass,
      exports: [TestComponent, TestModule],
    }) as ɵNgModuleDef<TestClass>;
    expectNgModuleDef(def, {exports: [TestComponent, TestModule]});
  });

  it('should compile an NgModule declaration with forward referenced exports classes', () => {
    const def = ɵɵngDeclareNgModule({
      type: TestClass,
      exports: () => [TestComponent, TestModule],
    }) as ɵNgModuleDef<TestClass>;
    expectNgModuleDef(def, {exports: [TestComponent, TestModule]});
  });

  it('should compile an NgModule declaration with schemas', () => {
    const def = ɵɵngDeclareNgModule({
      type: TestClass,
      schemas: [NO_ERRORS_SCHEMA],
    }) as ɵNgModuleDef<TestClass>;
    expectNgModuleDef(def, {schemas: [NO_ERRORS_SCHEMA]});
  });

  it('should compile an NgModule declaration with an id expression', () => {
    const id = 'ModuleID';
    const def = ɵɵngDeclareNgModule({type: TestClass, id}) as ɵNgModuleDef<TestClass>;
    expectNgModuleDef(def, {id: 'ModuleID'});
  });
});

class TestClass {}
class TestComponent {}
class TestModule {}

type NgModuleDefExpectations = jasmine.Expected<{
  schemas: SchemaMetadata[] | null;
  id: string | null;
  bootstrap: Type<unknown>[];
  declarations: Type<unknown>[];
  imports: Type<unknown>[];
  exports: Type<unknown>[];
}>;

/**
 * Asserts that the provided NgModule definition is according to the provided expectation.
 * Definition fields for which no expectation is present are verified to be initialized to their
 * default value.
 */
function expectNgModuleDef(
  actual: ɵNgModuleDef<unknown>,
  expected: Partial<NgModuleDefExpectations>,
): void {
  const expectation: NgModuleDefExpectations = {
    bootstrap: [],
    declarations: [],
    imports: [],
    exports: [],
    schemas: null,
    id: null,
    ...expected,
  };

  expect(actual.type).toBe(TestClass);
  expect(unwrap(actual.bootstrap)).toEqual(expectation.bootstrap);
  expect(unwrap(actual.declarations)).toEqual(expectation.declarations);
  expect(unwrap(actual.imports)).toEqual(expectation.imports);
  expect(unwrap(actual.exports)).toEqual(expectation.exports);
  expect(actual.schemas).toEqual(expectation.schemas);
  expect(actual.id).toEqual(expectation.id);
}

function unwrap(values: Type<any>[] | (() => Type<any>[])): Type<any>[] {
  return typeof values === 'function' ? values() : values;
}
