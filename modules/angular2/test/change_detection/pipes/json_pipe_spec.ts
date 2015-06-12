import {
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach,
  AsyncTestCompleter,
  inject,
  proxy,
  SpyObject,
  IS_DARTIUM
} from 'angular2/test_lib';
import {Json, RegExp, NumberWrapper, StringWrapper} from 'angular2/src/facade/lang';
import {ListWrapper} from 'angular2/src/facade/collection';

import {JsonPipe} from 'angular2/src/change_detection/pipes/json_pipe';

export function main() {
  describe("JsonPipe", () => {
    var regNewLine = '\n';
    var canHasUndefined;  // because Dart doesn't like undefined;
    var inceptionObj;
    var inceptionObjString;
    var catString;
    var pipe;
    var collection;

    function normalize(obj: string): string { return StringWrapper.replace(obj, regNewLine, ''); }

    beforeEach(() => {
      inceptionObj = {dream: {dream: {dream: 'Limbo'}}};
      inceptionObjString = "{\n" + "  \"dream\": {\n" + "    \"dream\": {\n" +
                           "      \"dream\": \"Limbo\"\n" + "    }\n" + "  }\n" + "}";


      catString = 'Inception Cat';
      pipe = new JsonPipe();
      collection = [];
    });

    describe("supports", () => {
      it("should support objects", () => { expect(pipe.supports(inceptionObj)).toBe(true); });

      it("should support strings", () => { expect(pipe.supports(catString)).toBe(true); });

      it("should support null", () => { expect(pipe.supports(null)).toBe(true); });

      it("should support NaN", () => { expect(pipe.supports(NumberWrapper.NaN)).toBe(true); });

      if (!IS_DARTIUM) {
        it("should support undefined",
           () => { expect(pipe.supports(canHasUndefined)).toBe(true); });
      }

    });

    describe("transform", () => {
      it("should return JSON-formatted string",
         () => { expect(pipe.transform(inceptionObj)).toEqual(inceptionObjString); });

      it("should return JSON-formatted string even when normalized", () => {
        var dream1 = normalize(pipe.transform(inceptionObj));
        var dream2 = normalize(inceptionObjString);
        expect(dream1).toEqual(dream2);
      });

      it("should return JSON-formatted string similar to Json.stringify", () => {
        var dream1 = normalize(pipe.transform(inceptionObj));
        var dream2 = normalize(Json.stringify(inceptionObj));
        expect(dream1).toEqual(dream2);
      });

      it("should return same ref when nothing has changed since the last call", () => {
        expect(pipe.transform(inceptionObj)).toEqual(inceptionObjString);
        expect(pipe.transform(inceptionObj)).toEqual(inceptionObjString);
      });


      it("should return a new value when something changed but the ref hasn't", () => {
        var stringCollection = '[]';
        var stringCollectionWith1 = '[\n' +
                                    '  1' +
                                    '\n]';

        expect(pipe.transform(collection)).toEqual(stringCollection);

        ListWrapper.push(collection, 1);

        expect(pipe.transform(collection)).toEqual(stringCollectionWith1);
      });

    });

    describe("onDestroy", () => {
      it("should do nothing when no latest value",
         () => { expect(() => pipe.onDestroy()).not.toThrow(); });
    });

  });
}
