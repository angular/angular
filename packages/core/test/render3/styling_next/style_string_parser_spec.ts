/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {updateStylingEntry} from '@angular/core/src/render3/styling/style_string_parser';

describe('map-based bindings', () => {
  describe('classes', () => {
    it('should add new class values into an empty string', () => {
      expect(updateStylingEntry('', '', '', true, false)).toEqual('');
      expect(updateStylingEntry('', 'prop', '', true, false)).toEqual('');
      expect(updateStylingEntry('', '', 'value', true, false)).toEqual('');
      expect(updateStylingEntry('', 'abc', true, true, false)).toEqual('abc');
      expect(updateStylingEntry('', 'xyz', 'true', true, false)).toEqual('xyz');
      expect(updateStylingEntry('', 'abc', false, true, false)).toEqual('');
      expect(updateStylingEntry('', 'xyz', null, true, false)).toEqual('');
    });

    it('should add new class values into an existing style string', () => {
      expect(updateStylingEntry('abc', 'xyz', true, true, false)).toEqual('abc xyz');
      expect(updateStylingEntry('abc xyz', 'xyz', true, true, false)).toEqual('abc xyz');
      expect(updateStylingEntry('abc xyz', 'abc', true, true, false)).toEqual('abc xyz');
      expect(updateStylingEntry('abc xyz', '123', true, true, false)).toEqual('abc xyz 123');
    });

    it('should remove values into an existing style string', () => {
      expect(updateStylingEntry('abc', 'abc', false, true, false)).toEqual('');
      expect(updateStylingEntry('abc xyz', 'xyz', false, true, false)).toEqual('abc');
      expect(updateStylingEntry('abc xyz', 'abc', false, true, false)).toEqual('xyz');
    });

    it('should add, modify and delete class entries from a string', () => {
      let s = 'def xyz';
      s = updateStylingEntry(s, 'abc', true, true, false);
      s = updateStylingEntry(s, 'abc', true, true, false);
      s = updateStylingEntry(s, 'xyz', false, true, false);
      s = updateStylingEntry(s, 'xyz', true, true, false);
      s = updateStylingEntry(s, 'def', true, true, false);
      expect(s).toEqual('def abc xyz');
    });
  });

  describe('styles', () => {
    it('should add new style values into an empty string', () => {
      expect(updateStylingEntry('', '', '', false, false)).toEqual('');
      expect(updateStylingEntry('', 'prop', '', false, false)).toEqual('');
      expect(updateStylingEntry('', '', 'value', false, false)).toEqual('');
      expect(updateStylingEntry('', 'width', '100px', false, false)).toEqual('width:100px');
      expect(updateStylingEntry('', 'border-radius', '100px', false, false))
          .toEqual('border-radius:100px');
      expect(updateStylingEntry('', 'width', '', false, false)).toEqual('');
      expect(updateStylingEntry('', 'width', null, false, false)).toEqual('');
    });

    it('should add new style values into an existing style string', () => {
      expect(updateStylingEntry('width:200px', 'height', '100px', false, false))
          .toEqual('width:200px; height:100px');
      expect(updateStylingEntry('width:200px; height:200px', 'opacity', '0.5', false, false))
          .toEqual('width:200px; height:200px; opacity:0.5');
    });

    it('should replace existing entries in a style string', () => {
      expect(updateStylingEntry('width:200px', 'width', '100px', false, false))
          .toEqual('width:100px');
      expect(updateStylingEntry(
                 'width:200px; height:200px; opacity:0.5', 'height', '500px', false, false))
          .toEqual('width:200px; height:500px; opacity:0.5');
    });

    it('should delete a prop entry from a string', () => {
      expect(updateStylingEntry('width:200px', 'width', null, false, false)).toEqual('');
      expect(updateStylingEntry('width:500px', 'width', '', false, false)).toEqual('');
      expect(
          updateStylingEntry('width:200px; height:200px; opacity:0.5', 'width', null, false, false))
          .toEqual('height:200px; opacity:0.5');
      expect(
          updateStylingEntry('width:200px; height:200px; opacity:0.5', 'width', '', false, false))
          .toEqual('height:200px; opacity:0.5');
      expect(updateStylingEntry(
                 'width:200px; height:200px; opacity:0.5', 'height', null, false, false))
          .toEqual('width:200px; opacity:0.5');
      expect(
          updateStylingEntry('width:200px; height:200px; opacity:0.5', 'height', '', false, false))
          .toEqual('width:200px; opacity:0.5');
    });

    it('should add, modify and delete prop entries from a string', () => {
      let s = 'opacity:0.5; font-size:20px';
      s = updateStylingEntry(s, 'width', null, false, false);
      s = updateStylingEntry(s, 'height', '200px', false, false);
      s = updateStylingEntry(s, 'color', 'red', false, false);
      s = updateStylingEntry(s, 'opacity', '1.0', false, false);
      s = updateStylingEntry(s, 'font-size', '', false, false);
      s = updateStylingEntry(s, 'width', '200px', false, false);
      expect(s).toEqual('opacity:1.0; height:200px; color:red; width:200px');
    });
  });
});
