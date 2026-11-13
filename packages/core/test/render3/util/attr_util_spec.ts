/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AttributeMarker} from '../../../src/render3';
import {TAttributes} from '../../../src/render3/interfaces/node';
import {Renderer} from '../../../src/render3/interfaces/renderer';
import {RElement} from '../../../src/render3/interfaces/renderer_dom';
import {
  isResourceAttribute,
  mergeHostAttribute,
  mergeHostAttrs,
  setUpAttributes,
} from '../../../src/render3/util/attrs_utils';

describe('attr_util', () => {
  describe('isResourceAttribute', () => {
    it('should only match the attributes that load a resource again when set', () => {
      expect(isResourceAttribute('iframe', 'src')).toBeTrue();
      expect(isResourceAttribute('embed', 'src')).toBeTrue();
      expect(isResourceAttribute('video', 'src')).toBeTrue();
      expect(isResourceAttribute('audio', 'src')).toBeTrue();
      expect(isResourceAttribute('object', 'data')).toBeTrue();
      expect(isResourceAttribute('img', 'src')).toBeFalse();
      expect(isResourceAttribute('object', 'src')).toBeFalse();
      expect(isResourceAttribute('video', 'data')).toBeFalse();
      expect(isResourceAttribute(null, 'src')).toBeFalse();
    });
  });

  describe('setUpAttributes', () => {
    function setUp(values: Record<string, string>, attrs: TAttributes, tagName: string | null) {
      const renderer = jasmine.createSpyObj<Renderer>('renderer', ['setAttribute', 'setProperty']);
      const element = {getAttribute: (name: string) => values[name] ?? null} as unknown as RElement;
      setUpAttributes(renderer, element, attrs, tagName);
      return {renderer, element};
    }

    it('should skip only the resource URL that a hydrated element already has', () => {
      const {renderer, element} = setUp(
        {src: 'clip.mp4', title: 'Clip'},
        ['src', 'clip.mp4', 'title', 'Clip'],
        'video',
      );

      expect(renderer.setAttribute.calls.allArgs()).toEqual([[element, 'title', 'Clip']]);
    });

    it('should write a resource URL that differs from the one in the DOM', () => {
      const {renderer, element} = setUp({src: 'old.mp4'}, ['src', 'new.mp4'], 'video');

      expect(renderer.setAttribute.calls.allArgs()).toEqual([[element, 'src', 'new.mp4']]);
    });

    it('should write an unchanged attribute that is not a resource URL', () => {
      const {renderer, element} = setUp({src: 'hero.jpg'}, ['src', 'hero.jpg'], 'img');

      expect(renderer.setAttribute.calls.allArgs()).toEqual([[element, 'src', 'hero.jpg']]);
    });

    it('should write a namespaced attribute even if it has the same name', () => {
      const {renderer, element} = setUp(
        {src: 'clip.mp4'},
        [AttributeMarker.NamespaceURI, 'urn:test', 'src', 'clip.mp4'],
        'video',
      );

      expect(renderer.setAttribute.calls.allArgs()).toEqual([
        [element, 'src', 'clip.mp4', 'urn:test'],
      ]);
    });

    it('should write every attribute of an element that was not hydrated', () => {
      const {renderer, element} = setUp({src: 'clip.mp4'}, ['src', 'clip.mp4'], null);

      expect(renderer.setAttribute.calls.allArgs()).toEqual([[element, 'src', 'clip.mp4']]);
    });

    it('should compare trusted values by their string value', () => {
      const trustedUrl = {toString: () => 'frame.html'} as unknown as string;
      const {renderer} = setUp({src: 'frame.html'}, ['src', trustedUrl], 'iframe');

      expect(renderer.setAttribute).not.toHaveBeenCalled();
    });

    it('should always set animation properties, which are not rendered as attributes', () => {
      const {renderer, element} = setUp({}, ['@trigger', 'state', '@.disabled', 'true'], 'video');

      expect(renderer.setProperty.calls.allArgs()).toEqual([
        [element, '@trigger', 'state'],
        [element, '@.disabled', 'true'],
      ]);
      expect(renderer.setAttribute).not.toHaveBeenCalled();
    });
  });

  describe('mergeHostAttribute', () => {
    it('should add new attributes', () => {
      const attrs: TAttributes = [];
      mergeHostAttribute(attrs, -1, 'Key', null, 'value');
      expect(attrs).toEqual(['Key', 'value']);

      mergeHostAttribute(attrs, -1, 'A', null, 'a');
      expect(attrs).toEqual(['Key', 'value', 'A', 'a']);

      mergeHostAttribute(attrs, -1, 'X', null, 'x');
      expect(attrs).toEqual(['Key', 'value', 'A', 'a', 'X', 'x']);

      mergeHostAttribute(attrs, -1, 'Key', null, 'new');
      expect(attrs).toEqual(['Key', 'new', 'A', 'a', 'X', 'x']);
    });

    it('should add new classes', () => {
      const attrs: TAttributes = [];
      mergeHostAttribute(attrs, AttributeMarker.Classes, 'CLASS', null, null);
      expect(attrs).toEqual([AttributeMarker.Classes, 'CLASS']);

      mergeHostAttribute(attrs, AttributeMarker.Classes, 'A', null, null);
      expect(attrs).toEqual([AttributeMarker.Classes, 'CLASS', 'A']);

      mergeHostAttribute(attrs, AttributeMarker.Classes, 'X', null, null);
      expect(attrs).toEqual([AttributeMarker.Classes, 'CLASS', 'A', 'X']);

      mergeHostAttribute(attrs, AttributeMarker.Classes, 'CLASS', null, null);
      expect(attrs).toEqual([AttributeMarker.Classes, 'CLASS', 'A', 'X']);
    });

    it('should add new styles', () => {
      const attrs: TAttributes = [];
      mergeHostAttribute(attrs, AttributeMarker.Styles, 'Style', null, 'v1');
      expect(attrs).toEqual([AttributeMarker.Styles, 'Style', 'v1']);

      mergeHostAttribute(attrs, AttributeMarker.Styles, 'A', null, 'v2');
      expect(attrs).toEqual([AttributeMarker.Styles, 'Style', 'v1', 'A', 'v2']);

      mergeHostAttribute(attrs, AttributeMarker.Styles, 'X', null, 'v3');
      expect(attrs).toEqual([AttributeMarker.Styles, 'Style', 'v1', 'A', 'v2', 'X', 'v3']);

      mergeHostAttribute(attrs, AttributeMarker.Styles, 'Style', null, 'new');
      expect(attrs).toEqual([AttributeMarker.Styles, 'Style', 'new', 'A', 'v2', 'X', 'v3']);
    });

    it('should keep different types together', () => {
      const attrs: TAttributes = [];
      mergeHostAttribute(attrs, -1, 'Key', null, 'value');
      expect(attrs).toEqual(['Key', 'value']);

      mergeHostAttribute(attrs, AttributeMarker.Classes, 'CLASS', null, null);
      expect(attrs).toEqual(['Key', 'value', AttributeMarker.Classes, 'CLASS']);

      mergeHostAttribute(attrs, AttributeMarker.Styles, 'Style', null, 'v1');
      expect(attrs).toEqual([
        'Key',
        'value',
        AttributeMarker.Classes,
        'CLASS',
        AttributeMarker.Styles,
        'Style',
        'v1',
      ]);

      mergeHostAttribute(attrs, -1, 'Key2', null, 'value2');
      expect(attrs).toEqual([
        'Key',
        'value',
        'Key2',
        'value2',
        AttributeMarker.Classes,
        'CLASS',
        AttributeMarker.Styles,
        'Style',
        'v1',
      ]);

      mergeHostAttribute(attrs, AttributeMarker.Classes, 'CLASS2', null, null);
      expect(attrs).toEqual([
        'Key',
        'value',
        'Key2',
        'value2',
        AttributeMarker.Classes,
        'CLASS',
        'CLASS2',
        AttributeMarker.Styles,
        'Style',
        'v1',
      ]);

      mergeHostAttribute(attrs, AttributeMarker.Styles, 'Style2', null, 'v2');
      expect(attrs).toEqual([
        'Key',
        'value',
        'Key2',
        'value2',
        AttributeMarker.Classes,
        'CLASS',
        'CLASS2',
        AttributeMarker.Styles,
        'Style',
        'v1',
        'Style2',
        'v2',
      ]);

      mergeHostAttribute(attrs, AttributeMarker.NamespaceURI, 'uri', 'key', 'value');
      expect(attrs).toEqual([
        'Key',
        'value',
        'Key2',
        'value2',
        AttributeMarker.NamespaceURI,
        'uri',
        'key',
        'value',
        AttributeMarker.Classes,
        'CLASS',
        'CLASS2',
        AttributeMarker.Styles,
        'Style',
        'v1',
        'Style2',
        'v2',
      ]);
      mergeHostAttribute(attrs, AttributeMarker.NamespaceURI, 'uri', 'key', 'new value');
      expect(attrs).toEqual([
        'Key',
        'value',
        'Key2',
        'value2',
        AttributeMarker.NamespaceURI,
        'uri',
        'key',
        'new value',
        AttributeMarker.Classes,
        'CLASS',
        'CLASS2',
        AttributeMarker.Styles,
        'Style',
        'v1',
        'Style2',
        'v2',
      ]);
    });
  });

  describe('mergeHostAttrs', () => {
    it('should ignore nulls/empty', () => {
      expect(mergeHostAttrs(null, null)).toEqual(null);
      expect(mergeHostAttrs([], null)).toEqual([]);
      expect(mergeHostAttrs(null, [])).toEqual(null);
    });

    it('should copy if dst is null', () => {
      expect(mergeHostAttrs(null, ['K', 'v'])).toEqual(['K', 'v']);
      expect(mergeHostAttrs(['K', '', 'X', 'x'], ['K', 'v'])).toEqual(['K', 'v', 'X', 'x']);
    });
  });
});
