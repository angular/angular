import {ddescribe, describe, it, xit, iit, expect, beforeEach} from 'angular2/test_lib';

import {Locals} from 'angular2/src/change_detection/parser/locals';

import {MapWrapper} from 'angular2/src/facade/collection';

export function main() {
  describe('Locals', () => {
    var locals: Locals;
    beforeEach(() => {
      locals = new Locals(null, MapWrapper.createFromPairs([['key', 'value'], ['nullKey', null]]));
    });

    it('should support getting values', () => {
      expect(locals.get('key')).toBe('value');
      expect(() => locals.get('notPresent')).toThrowError(new RegExp("Cannot find"));
    });

    it('should support checking if key is present', () => {
      expect(locals.contains('key')).toBe(true);
      expect(locals.contains('nullKey')).toBe(true);
      expect(locals.contains('notPresent')).toBe(false);
    });

    it('should support setting keys', () => {
      locals.set('key', 'bar');
      expect(locals.get('key')).toBe('bar');
    });

    it('should not support setting keys that are not present already',
       () => { expect(() => locals.set('notPresent', 'bar')).toThrowError(); });

    it('should clearValues', () => {
      locals.clearValues();
      expect(locals.get('key')).toBe(null);
    });
  })
}
