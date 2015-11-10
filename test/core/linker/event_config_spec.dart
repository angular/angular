library angular2.test.core.linker.event_config_spec;

import "package:angular2/src/core/linker/event_config.dart" show EventConfig;
import "package:angular2/testing_internal.dart"
    show ddescribe, describe, expect, it;

main() {
  describe("EventConfig", () {
    describe("parse", () {
      it("should handle short form events", () {
        var eventConfig = EventConfig.parse("shortForm");
        expect(eventConfig.fieldName).toEqual("shortForm");
        expect(eventConfig.eventName).toEqual("shortForm");
        expect(eventConfig.isLongForm).toEqual(false);
      });
      it("should handle long form events", () {
        var eventConfig = EventConfig.parse("fieldName: eventName");
        expect(eventConfig.fieldName).toEqual("fieldName");
        expect(eventConfig.eventName).toEqual("eventName");
        expect(eventConfig.isLongForm).toEqual(true);
      });
    });
    describe("getFullName", () {
      it("should handle short form events", () {
        var eventConfig = new EventConfig("shortForm", "shortForm", false);
        expect(eventConfig.getFullName()).toEqual("shortForm");
      });
      it("should handle long form events", () {
        var eventConfig = new EventConfig("fieldName", "eventName", true);
        expect(eventConfig.getFullName()).toEqual("fieldName:eventName");
      });
    });
  });
}
