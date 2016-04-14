import {describe, iit, it, expect, beforeEach} from 'angular2/testing_internal';
import {ReflectiveKey, KeyRegistry} from 'angular2/src/core/di/reflective_key';

export function main() {
  describe("key", function() {
    var registry: KeyRegistry;

    beforeEach(function() { registry = new KeyRegistry(); });

    it('should be equal to another key if type is the same',
       function() { expect(registry.get('car')).toBe(registry.get('car')); });

    it('should not be equal to another key if types are different',
       function() { expect(registry.get('car')).not.toBe(registry.get('porsche')); });

    it('should return the passed in key',
       function() { expect(registry.get(registry.get('car'))).toBe(registry.get('car')); });

  });
}