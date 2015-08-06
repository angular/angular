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

import {JsonPipe} from 'angular2/src/change_detection/pipes/json_pipe';

export function main() {
  describe("JsonPipe", () => {
    var regNewLine = '\n';
    var inceptionObj;
    var inceptionObjString;
    var pipe;
    var collection: number[];

    function normalize(obj: string): string { return StringWrapper.replace(obj, regNewLine, ''); }

    beforeEach(() => {
      inceptionObj = {dream: {dream: {dream: 'Limbo'}}};
      inceptionObjString = "{\n" + "  \"dream\": {\n" + "    \"dream\": {\n" +
                           "      \"dream\": \"Limbo\"\n" + "    }\n" + "  }\n" + "}";


      pipe = new JsonPipe();
      collection = [];
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

        collection.push(1);

        expect(pipe.transform(collection)).toEqual(stringCollectionWith1);
      });

    });

    describe("onDestroy", () => {
      it("should do nothing when no latest value",
         () => { expect(() => pipe.onDestroy()).not.toThrow(); });
    });

  });
}
