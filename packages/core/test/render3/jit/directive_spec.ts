/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, HostListener, Input} from '@angular/core';
import {setClassMetadata} from '@angular/core/src/render3/metadata';

import {convertToR3QueryMetadata, directiveMetadata, extendsDirectlyFromObject} from '../../../src/render3/jit/directive';

describe('jit directive helper functions', () => {
  describe('extendsDirectlyFromObject', () => {
    // Inheritance Example using Classes
    class Parent {}
    class Child extends Parent {}

    // Inheritance Example using Function
    const Parent5 = function Parent5() {} as any as {new (): {}};
    const Child5 = function Child5() {} as any as {new (): {}};
    Child5.prototype = new Parent5;
    Child5.prototype.constructor = Child5;

    it('should correctly behave with instanceof', () => {
      expect(new Child() instanceof Object).toBeTruthy();
      expect(new Child() instanceof Parent).toBeTruthy();
      expect(new Parent() instanceof Child).toBeFalsy();

      expect(new Child5() instanceof Object).toBeTruthy();
      expect(new Child5() instanceof Parent5).toBeTruthy();
      expect(new Parent5() instanceof Child5).toBeFalsy();
    });

    it('should detect direct inheritance form Object', () => {
      expect(extendsDirectlyFromObject(Parent)).toBeTruthy();
      expect(extendsDirectlyFromObject(Child)).toBeFalsy();

      expect(extendsDirectlyFromObject(Parent5)).toBeTruthy();
      expect(extendsDirectlyFromObject(Child5)).toBeFalsy();
    });
  });

  describe('convertToR3QueryMetadata', () => {
    it('should convert decorator with a single string selector', () => {
      expect(convertToR3QueryMetadata('propName', {
        selector: 'localRef',
        descendants: false,
        first: false,
        isViewQuery: false,
        read: undefined,
        static: false,
        emitDistinctChangesOnly: false,
      })).toEqual({
        propertyName: 'propName',
        predicate: ['localRef'],
        descendants: false,
        first: false,
        read: null,
        static: false,
        emitDistinctChangesOnly: false,
      });
    });

    it('should convert decorator with multiple string selectors', () => {
      expect(convertToR3QueryMetadata('propName', {
        selector: 'foo, bar,baz',
        descendants: true,
        first: true,
        isViewQuery: true,
        read: undefined,
        static: false,
        emitDistinctChangesOnly: false,
      })).toEqual({
        propertyName: 'propName',
        predicate: ['foo', 'bar', 'baz'],
        descendants: true,
        first: true,
        read: null,
        static: false,
        emitDistinctChangesOnly: false,
      });
    });

    it('should convert decorator with type selector and read option', () => {
      class Directive {}

      const converted = convertToR3QueryMetadata('propName', {
        selector: Directive,
        descendants: true,
        first: true,
        isViewQuery: true,
        read: Directive,
        static: false,
        emitDistinctChangesOnly: false,
      });

      expect(converted.predicate).toEqual(Directive);
      expect(converted.read).toEqual(Directive);
    });
  });

  describe('directiveMetadata', () => {
    it('should not inherit propMetadata from super class', () => {
      class SuperDirective {}
      setClassMetadata(
          SuperDirective, [{type: Directive, args: []}], null,
          {handleClick: [{type: HostListener, args: ['click']}]});

      class SubDirective extends SuperDirective {}
      setClassMetadata(SubDirective, [{type: Directive, args: []}], null, null);

      expect(directiveMetadata(SuperDirective, {}).propMetadata.handleClick).toBeTruthy();
      expect(directiveMetadata(SubDirective, {}).propMetadata.handleClick).toBeFalsy();
    });

    it('should not inherit propMetadata from grand super class', () => {
      class SuperSuperDirective {}
      setClassMetadata(
          SuperSuperDirective, [{type: Directive, args: []}], null,
          {handleClick: [{type: HostListener, args: ['click']}]});

      class SuperDirective {}
      setClassMetadata(SuperDirective, [{type: Directive, args: []}], null, null);

      class SubDirective extends SuperDirective {}

      setClassMetadata(SubDirective, [{type: Directive, args: []}], null, null);

      expect(directiveMetadata(SuperSuperDirective, {}).propMetadata.handleClick).toBeTruthy();
      expect(directiveMetadata(SuperDirective, {}).propMetadata.handleClick).toBeFalsy();
      expect(directiveMetadata(SubDirective, {}).propMetadata.handleClick).toBeFalsy();
    });

    it('should not inherit propMetadata from super class when sub class has its own propMetadata',
       () => {
         class SuperDirective {}
         setClassMetadata(SuperDirective, [{type: Directive}], null, {
           someInput: [{type: Input}],
           handleClick: [{type: HostListener, args: ['click', ['$event']]}]
         });

         class SubDirective extends SuperDirective {}
         setClassMetadata(
             SubDirective, [{type: Directive}], null, {someOtherInput: [{type: Input}]});

         const superPropMetadata = directiveMetadata(SuperDirective, {}).propMetadata;
         const subPropMetadata = directiveMetadata(SubDirective, {}).propMetadata;

         expect(superPropMetadata.handleClick).toBeTruthy();
         expect(superPropMetadata.someInput).toBeTruthy();

         expect(subPropMetadata.handleClick).toBeFalsy();
         expect(subPropMetadata.someInput).toBeFalsy();
         expect(subPropMetadata.someOtherInput).toBeTruthy();
       });
  });
});
