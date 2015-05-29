import {ddescribe, describe, it, iit, xit, expect, beforeEach, afterEach} from 'angular2/test_lib';

import {
  PreGeneratedChangeDetection,
  ChangeDetectorDefinition,
  ProtoChangeDetector,
  DynamicProtoChangeDetector
} from 'angular2/change_detection';

class DummyChangeDetector extends ProtoChangeDetector {}

export function main() {
  describe("PreGeneratedChangeDetection", () => {
    var proto;
    var def;

    beforeEach(() => {
      proto = new DummyChangeDetector();
      def = new ChangeDetectorDefinition('id', null, [], [], []);
    });

    it("should return a proto change detector when one is available", () => {
      var map = {'id': (registry, def) => proto};
      var cd = new PreGeneratedChangeDetection(null, map);

      expect(cd.createProtoChangeDetector(def)).toBe(proto)
    });

    it("should delegate to dynamic change detection otherwise", () => {
      var cd = new PreGeneratedChangeDetection(null, {});
      expect(cd.createProtoChangeDetector(def)).toBeAnInstanceOf(DynamicProtoChangeDetector);
    });
  });
}
