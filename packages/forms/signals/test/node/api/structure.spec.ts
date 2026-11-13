/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {apply, applyEach, form, required, schema} from '@angular/forms/signals';
import {FieldNode} from '../../../src/field/node';

describe('structure APIs', () => {
  describe('apply', () => {
    it('should maintain order when applying to child of root path', () => {
      const s = schema<{a: string}>((p) => {
        required(p.a, {message: 'before'});
        apply(p.a, (prop) => {
          required(prop, {message: 'apply'});
        });
        required(p.a, {message: 'after'});
      });

      const data = signal({a: ''});
      const f = form(data, s, {injector: TestBed.inject(Injector)});

      expect(f.a().errors()).toEqual([
        jasmine.objectContaining({message: 'before'}),
        jasmine.objectContaining({message: 'apply'}),
        jasmine.objectContaining({message: 'after'}),
      ]);
    });

    it('should maintain order when applying to root path', () => {
      const s = schema<{a: {b: string}}>((p) => {
        required(p.a.b, {message: 'before'});
        apply(p, (prop) => {
          required(prop.a.b, {message: 'apply'});
        });
        required(p.a.b, {message: 'after'});
      });

      const data = signal({a: {b: ''}});
      const f = form(data, s, {injector: TestBed.inject(Injector)});

      expect(f.a.b().errors()).toEqual([
        jasmine.objectContaining({message: 'before'}),
        jasmine.objectContaining({message: 'apply'}),
        jasmine.objectContaining({message: 'after'}),
      ]);
    });

    it('should apply logic to each property', () => {
      const s = schema<{a: string; b: string}>((p) => {
        applyEach(p, (prop) => {
          required(prop, {message: 'each'});
        });
      });

      const data = signal({a: '', b: ''});
      const f = form(data, s, {injector: TestBed.inject(Injector)});

      expect(f.a().errors()).toEqual([jasmine.objectContaining({message: 'each'})]);
      expect(f.b().errors()).toEqual([jasmine.objectContaining({message: 'each'})]);
    });

    it('should merge each property logic with specific property logic', () => {
      const s = schema<{a: string; b: string}>((p) => {
        required(p.a, {message: 'before'});
        applyEach(p, (prop) => {
          required(prop, {message: 'each'});
        });
        required(p.a, {message: 'after'});
      });

      const data = signal({a: '', b: ''});
      const f = form(data, s, {injector: TestBed.inject(Injector)});

      expect(f.a().errors()).toEqual([
        jasmine.objectContaining({message: 'before'}),
        jasmine.objectContaining({message: 'each'}),
        jasmine.objectContaining({message: 'after'}),
      ]);
      expect(f.b().errors()).toEqual([jasmine.objectContaining({message: 'each'})]);
    });
  });

  describe('lazy materialization', () => {
    it('should stay unmaterialized after cleanup when children have no schema logic', async () => {
      const s = schema<{a: {b: string}}>((p) => {
        // No logic applied
      });

      const data = signal({a: {b: 'test'}});
      const f = form(data, s, {injector: TestBed.inject(Injector)});

      const structure = (f() as FieldNode).structure;
      expect(structure._areChildrenMaterialized()).toBeFalse();

      await TestBed.inject(ApplicationRef).whenStable();

      expect(structure._areChildrenMaterialized()).toBeFalse();

      data.set({a: {b: 'updated'}});
      await TestBed.inject(ApplicationRef).whenStable();

      expect(structure._areChildrenMaterialized()).toBeFalse();
      expect(f().value()).toEqual({a: {b: 'updated'}});
    });

    it('should keep children of materialized siblings lazy during cleanup', async () => {
      const data = signal({a: {b: 'test'}, unused: {nested: {value: 'test'}}});
      const f = form(data, {injector: TestBed.inject(Injector)});
      const childA = f.a() as FieldNode;

      await TestBed.inject(ApplicationRef).whenStable();

      const children = (f() as FieldNode).structure.materializedChildren();
      expect(children.map((child) => child.structure.keyInParent())).toEqual(['a', 'unused']);
      expect(children[0]).toBe(childA);
      expect(children[0].structure._areChildrenMaterialized()).toBeFalse();
      expect(children[1].structure._areChildrenMaterialized()).toBeFalse();
      expect(f.a.b().value()).toBe('test');
    });

    it('should clean up removed fields and preserve fields moved within an array', async () => {
      const first = {name: 'first'};
      const second = {name: 'second'};
      const data = signal([first, second]);
      const f = form(data, {injector: TestBed.inject(Injector)});

      await TestBed.inject(ApplicationRef).whenStable();

      const firstField = f[0]();
      const secondField = f[1]();
      const firstNameField = f[0].name();
      const secondStructure = (secondField as FieldNode).structure;
      const destroyFirst = spyOn((firstField as FieldNode).structure, 'destroy').and.callThrough();
      const destroyFirstName = spyOn(
        (firstNameField as FieldNode).structure,
        'destroy',
      ).and.callThrough();
      const destroySecond = spyOn(secondStructure, 'destroy').and.callThrough();

      await TestBed.inject(ApplicationRef).whenStable();

      expect(secondStructure._areChildrenMaterialized()).toBeFalse();

      data.set([second, first]);
      await TestBed.inject(ApplicationRef).whenStable();

      expect(f[0]()).toBe(secondField);
      expect(f[1]()).toBe(firstField);
      expect(f[1].name()).toBe(firstNameField);
      expect(secondStructure._areChildrenMaterialized()).toBeFalse();
      expect(destroyFirst).not.toHaveBeenCalled();
      expect(destroyFirstName).not.toHaveBeenCalled();
      expect(destroySecond).not.toHaveBeenCalled();

      data.set([second]);
      await TestBed.inject(ApplicationRef).whenStable();

      expect(destroyFirst).toHaveBeenCalledTimes(1);
      expect(destroyFirstName).toHaveBeenCalledTimes(1);
      expect(destroySecond).not.toHaveBeenCalled();
      expect(f[0]()).toBe(secondField);
      expect(secondStructure._areChildrenMaterialized()).toBeFalse();

      data.set([]);
      await TestBed.inject(ApplicationRef).whenStable();

      expect(destroyFirst).toHaveBeenCalledTimes(1);
      expect(destroyFirstName).toHaveBeenCalledTimes(1);
      expect(destroySecond).toHaveBeenCalledTimes(1);
    });

    it('should materialize children when explicitly accessed', () => {
      const s = schema<{a: {b: string}}>((p) => {
        // No logic applied
      });

      const data = signal({a: {b: 'test'}});
      const f = form(data, s, {injector: TestBed.inject(Injector)});

      // Initially false
      expect((f() as any).structure._areChildrenMaterialized()).toBeFalse();

      // Accessing 'a' forces materialization of root's children
      const childA = f.a;
      expect((f() as any).structure._areChildrenMaterialized()).toBeTrue();

      // 'a' itself should not have materialized its children ('b') yet
      expect((childA() as any).structure._areChildrenMaterialized()).toBeFalse();
    });

    it('should eagerly materialize children when they have schema logic', async () => {
      const s = schema<{a: {b: string}}>((p) => {
        required(p.a.b, {message: 'required'});
      });

      const data = signal({a: {b: 'test'}});
      const f = form(data, s, {injector: TestBed.inject(Injector)});

      // Because 'a.b' has rules, 'a' and 'b' must be materialized up the tree
      expect((f() as any).structure._areChildrenMaterialized()).toBeTrue();
      expect((f.a() as any).structure._areChildrenMaterialized()).toBeTrue();

      await TestBed.inject(ApplicationRef).whenStable();

      data.set({a: {b: ''}});
      await TestBed.inject(ApplicationRef).whenStable();

      expect(f.a.b().errors()).toEqual([jasmine.objectContaining({kind: 'required'})]);
    });
  });
});
