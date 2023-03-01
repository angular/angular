/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MetadataOverrider} from '@angular/platform-browser-dynamic/testing/src/metadata_overrider';
import {expect} from '@angular/platform-browser/testing/src/matchers';

interface SomeMetadataType {
  plainProp?: string;
  getterProp?: string;
  arrayProp?: any[];
}

interface OtherMetadataType extends SomeMetadataType {
  otherPlainProp?: string;
}

class SomeMetadata implements SomeMetadataType {
  plainProp: string;
  private _getterProp: string;
  arrayProp: any[];

  constructor(options: SomeMetadataType) {
    this.plainProp = options.plainProp!;
    this._getterProp = options.getterProp!;
    this.arrayProp = options.arrayProp!;
    Object.defineProperty(this, 'getterProp', {
      enumerable: true,  // getters are non-enumerable by default in es2015
      get: () => this._getterProp,
    });
  }
}

class OtherMetadata extends SomeMetadata implements OtherMetadataType {
  otherPlainProp: string;

  constructor(options: OtherMetadataType) {
    super({
      plainProp: options.plainProp,
      getterProp: options.getterProp,
      arrayProp: options.arrayProp
    });

    this.otherPlainProp = options.otherPlainProp!;
  }
}

{
  describe('metadata overrider', () => {
    let overrider: MetadataOverrider;

    beforeEach(() => {
      overrider = new MetadataOverrider();
    });

    it('should return a new instance with the same values', () => {
      const oldInstance = new SomeMetadata({plainProp: 'somePlainProp', getterProp: 'someInput'});
      const newInstance = overrider.overrideMetadata(SomeMetadata, oldInstance, {});
      expect(newInstance).not.toBe(oldInstance);
      expect(newInstance).toBeAnInstanceOf(SomeMetadata);
      expect(newInstance).toEqual(oldInstance);
    });

    it('should set individual properties and keep others', () => {
      const oldInstance =
          new SomeMetadata({plainProp: 'somePlainProp', getterProp: 'someGetterProp'});
      const newInstance =
          overrider.overrideMetadata(SomeMetadata, oldInstance, {set: {plainProp: 'newPlainProp'}});
      expect(newInstance)
          .toEqual(new SomeMetadata({plainProp: 'newPlainProp', getterProp: 'someGetterProp'}));
    });

    describe('add properties', () => {
      it('should replace non array values', () => {
        const oldInstance =
            new SomeMetadata({plainProp: 'somePlainProp', getterProp: 'someGetterProp'});
        const newInstance = overrider.overrideMetadata(
            SomeMetadata, oldInstance, {add: {plainProp: 'newPlainProp'}});
        expect(newInstance)
            .toEqual(new SomeMetadata({plainProp: 'newPlainProp', getterProp: 'someGetterProp'}));
      });

      it('should add to array values', () => {
        const oldInstance = new SomeMetadata({arrayProp: ['a']});
        const newInstance =
            overrider.overrideMetadata(SomeMetadata, oldInstance, {add: {arrayProp: ['b']}});
        expect(newInstance).toEqual(new SomeMetadata({arrayProp: ['a', 'b']}));
      });
    });

    describe('remove', () => {
      it('should set values to undefined if their value matches', () => {
        const oldInstance =
            new SomeMetadata({plainProp: 'somePlainProp', getterProp: 'someGetterProp'});
        const newInstance = overrider.overrideMetadata(
            SomeMetadata, oldInstance, {remove: {plainProp: 'somePlainProp'}});
        expect(newInstance)
            .toEqual(new SomeMetadata({plainProp: undefined, getterProp: 'someGetterProp'}));
      });

      it('should leave values if their value does not match', () => {
        const oldInstance =
            new SomeMetadata({plainProp: 'somePlainProp', getterProp: 'someGetterProp'});
        const newInstance = overrider.overrideMetadata(
            SomeMetadata, oldInstance, {remove: {plainProp: 'newPlainProp'}});
        expect(newInstance)
            .toEqual(new SomeMetadata({plainProp: 'somePlainProp', getterProp: 'someGetterProp'}));
      });

      it('should remove a value from an array', () => {
        const oldInstance =
            new SomeMetadata({arrayProp: ['a', 'b', 'c'], getterProp: 'someGetterProp'});
        const newInstance = overrider.overrideMetadata(
            SomeMetadata, oldInstance, {remove: {arrayProp: ['a', 'c']}});
        expect(newInstance)
            .toEqual(new SomeMetadata({arrayProp: ['b'], getterProp: 'someGetterProp'}));
      });

      it('should support types as values', () => {
        class Class1 {}
        class Class2 {}
        class Class3 {}

        const instance1 = new SomeMetadata({arrayProp: [Class1, Class2, Class3]});
        const instance2 =
            overrider.overrideMetadata(SomeMetadata, instance1, {remove: {arrayProp: [Class1]}});
        expect(instance2).toEqual(new SomeMetadata({arrayProp: [Class2, Class3]}));
        const instance3 =
            overrider.overrideMetadata(SomeMetadata, instance2, {remove: {arrayProp: [Class3]}});
        expect(instance3).toEqual(new SomeMetadata({arrayProp: [Class2]}));
      });
    });

    describe('subclasses', () => {
      it('should set individual properties and keep others', () => {
        const oldInstance = new OtherMetadata({
          plainProp: 'somePlainProp',
          getterProp: 'someGetterProp',
          otherPlainProp: 'newOtherProp'
        });
        const newInstance = overrider.overrideMetadata(
            OtherMetadata, oldInstance, {set: {plainProp: 'newPlainProp'}});
        expect(newInstance).toEqual(new OtherMetadata({
          plainProp: 'newPlainProp',
          getterProp: 'someGetterProp',
          otherPlainProp: 'newOtherProp'
        }));
      });
    });
  });
}
