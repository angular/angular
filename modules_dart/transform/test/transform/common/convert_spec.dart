library angular2.test.transform.common.convert_spec;

import "package:angular2/src/core/facade/collection.dart" show MapWrapper;
import "package:angular2/src/core/render/api.dart" show RenderDirectiveMetadata;
import "package:angular2/src/transform/common/convert.dart"
    show directiveMetadataFromMap, directiveMetadataToMap;
import "package:angular2/test_lib.dart" show ddescribe, describe, expect, it;
import "package:angular2/src/core/change_detection/change_detection.dart"
    show ChangeDetectionStrategy;

main() {
  describe("convert", () {
    it("directiveMetadataToMap", () {
      var someComponent = new RenderDirectiveMetadata(
          compileChildren: false,
          hostListeners: MapWrapper.createFromPairs([
            ["LKey", "LVal"]
          ]),
          hostProperties: MapWrapper.createFromPairs([
            ["PKey", "PVal"]
          ]),
          hostAttributes: MapWrapper.createFromPairs([
            ["AtKey", "AtVal"]
          ]),
          id: "someComponent",
          properties: ["propKey: propVal"],
          readAttributes: ["read1", "read2"],
          selector: "some-comp",
          type: RenderDirectiveMetadata.COMPONENT_TYPE,
          exportAs: "aaa",
          callOnDestroy: true,
          callOnChanges: true,
          callDoCheck: true,
          callOnInit: true,
          callAfterContentInit: true,
          callAfterContentChecked: true,
          callAfterViewInit: true,
          callAfterViewChecked: true,
          events: ["onFoo", "onBar"],
          changeDetection: ChangeDetectionStrategy.CheckOnce);
      var map = directiveMetadataToMap(someComponent);
      expect(map["compileChildren"]).toEqual(false);
      expect(map["hostListeners"]).toEqual(MapWrapper.createFromPairs([
        ["LKey", "LVal"]
      ]));
      expect(map["hostProperties"]).toEqual(MapWrapper.createFromPairs([
        ["PKey", "PVal"]
      ]));
      expect(map["hostAttributes"]).toEqual(MapWrapper.createFromPairs([
        ["AtKey", "AtVal"]
      ]));
      expect(map["id"]).toEqual("someComponent");
      expect(map["properties"]).toEqual(["propKey: propVal"]);
      expect(map["readAttributes"]).toEqual(["read1", "read2"]);
      expect(map["selector"]).toEqual("some-comp");
      expect(map["type"]).toEqual(RenderDirectiveMetadata.COMPONENT_TYPE);
      expect(map["callOnDestroy"]).toEqual(true);
      expect(map["callDoCheck"]).toEqual(true);
      expect(map["callOnChanges"]).toEqual(true);
      expect(map["callOnInit"]).toEqual(true);
      expect(map["callAfterContentInit"]).toEqual(true);
      expect(map["callAfterContentChecked"]).toEqual(true);
      expect(map["callAfterViewInit"]).toEqual(true);
      expect(map["callAfterViewChecked"]).toEqual(true);
      expect(map["exportAs"]).toEqual("aaa");
      expect(map["events"]).toEqual(["onFoo", "onBar"]);
      expect(map["changeDetection"])
          .toEqual(ChangeDetectionStrategy.CheckOnce.index);
    });
    it("mapToDirectiveMetadata", () {
      var map = MapWrapper.createFromPairs([
        ["compileChildren", false],
        [
          "hostProperties",
          MapWrapper.createFromPairs([
            ["PKey", "testVal"]
          ])
        ],
        [
          "hostListeners",
          MapWrapper.createFromPairs([
            ["LKey", "testVal"]
          ])
        ],
        [
          "hostAttributes",
          MapWrapper.createFromPairs([
            ["AtKey", "testVal"]
          ])
        ],
        ["id", "testId"],
        [
          "properties",
          ["propKey: propVal"]
        ],
        [
          "readAttributes",
          ["readTest1", "readTest2"]
        ],
        ["selector", "testSelector"],
        ["type", RenderDirectiveMetadata.DIRECTIVE_TYPE],
        ["exportAs", "aaa"],
        ["callOnDestroy", true],
        ["callDoCheck", true],
        ["callOnInit", true],
        ["callOnChanges", true],
        ["callAfterContentInit", true],
        ["callAfterContentChecked", true],
        ["callAfterViewInit", true],
        ["callAfterViewChecked", true],
        [
          "events",
          ["onFoo", "onBar"]
        ],
        ["changeDetection", ChangeDetectionStrategy.CheckOnce.index]
      ]);
      var meta = directiveMetadataFromMap(map);
      expect(meta.compileChildren).toEqual(false);
      expect(meta.hostProperties).toEqual(MapWrapper.createFromPairs([
        ["PKey", "testVal"]
      ]));
      expect(meta.hostListeners).toEqual(MapWrapper.createFromPairs([
        ["LKey", "testVal"]
      ]));
      expect(meta.hostAttributes).toEqual(MapWrapper.createFromPairs([
        ["AtKey", "testVal"]
      ]));
      expect(meta.id).toEqual("testId");
      expect(meta.properties).toEqual(["propKey: propVal"]);
      expect(meta.readAttributes).toEqual(["readTest1", "readTest2"]);
      expect(meta.selector).toEqual("testSelector");
      expect(meta.type).toEqual(RenderDirectiveMetadata.DIRECTIVE_TYPE);
      expect(meta.exportAs).toEqual("aaa");
      expect(meta.callOnDestroy).toEqual(true);
      expect(meta.callDoCheck).toEqual(true);
      expect(meta.callOnInit).toEqual(true);
      expect(meta.callOnChanges).toEqual(true);
      expect(meta.callAfterContentInit).toEqual(true);
      expect(meta.callAfterContentChecked).toEqual(true);
      expect(meta.callAfterViewInit).toEqual(true);
      expect(meta.callAfterViewChecked).toEqual(true);
      expect(meta.events).toEqual(["onFoo", "onBar"]);
      expect(meta.changeDetection).toEqual(ChangeDetectionStrategy.CheckOnce);
    });
  });
}
