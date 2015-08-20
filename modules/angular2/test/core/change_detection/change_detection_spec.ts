import {
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach,
  SpyProtoChangeDetector
} from 'angular2/test_lib';

import {
  PreGeneratedChangeDetection,
  ChangeDetectorDefinition,
  DynamicProtoChangeDetector
} from 'angular2/src/change_detection/change_detection';

export function main() {
  describe("PreGeneratedChangeDetection", () => {
    var proto;
    var def;

    beforeEach(() => {
      proto = new SpyProtoChangeDetector();
      def = new ChangeDetectorDefinition('id', null, [], [], [], [], null);
    });

    it("should return a proto change detector when one is available", () => {
      var map = {'id': (def) => proto};
      var cd = new PreGeneratedChangeDetection(null, map);

      expect(cd.getProtoChangeDetector('id', def)).toBe(proto)
    });

    it("should delegate to dynamic change detection otherwise", () => {
      var cd = new PreGeneratedChangeDetection(null, {});
      expect(cd.getProtoChangeDetector('id', def)).toBeAnInstanceOf(DynamicProtoChangeDetector);
    });
  });
}
