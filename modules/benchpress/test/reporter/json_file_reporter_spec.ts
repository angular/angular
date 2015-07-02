import {
  afterEach,
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xit,
} from 'angular2/test_lib';

import {DateWrapper, Json, RegExpWrapper, isPresent} from 'angular2/src/facade/lang';
import {PromiseWrapper} from 'angular2/src/facade/async';

import {bind, Injector, SampleDescription, MeasureValues, Options} from 'benchpress/common';


import {JsonFileReporter} from 'benchpress/src/reporter/json_file_reporter';

export function main() {
  describe('file reporter', () => {
    var loggedFile;

    function createReporter({sampleId, descriptions, metrics, path}) {
      var bindings = [
        JsonFileReporter.BINDINGS,
        bind(SampleDescription).toValue(new SampleDescription(sampleId, descriptions, metrics)),
        bind(JsonFileReporter.PATH).toValue(path),
        bind(Options.NOW).toValue(() => DateWrapper.fromMillis(1234)),
        bind(Options.WRITE_FILE)
            .toValue((filename, content) => {
              loggedFile = {'filename': filename, 'content': content};
              return PromiseWrapper.resolve(null);
            })
      ];
      return Injector.resolveAndCreate(bindings).get(JsonFileReporter);
    }

    it('should write all data into a file', inject([AsyncTestCompleter], (async) => {
         createReporter({
           sampleId: 'someId',
           descriptions: [{'a': 2}],
           path: 'somePath',
           metrics: {'script': 'script time'}
         })
             .reportSample([mv(0, 0, {'a': 3, 'b': 6})],
                           [mv(0, 0, {'a': 3, 'b': 6}), mv(1, 1, {'a': 5, 'b': 9})]);
         var regExp = RegExpWrapper.create('somePath/someId_\\d+\\.json');
         expect(isPresent(RegExpWrapper.firstMatch(regExp, loggedFile['filename']))).toBe(true);
         var parsedContent = Json.parse(loggedFile['content']);
         expect(parsedContent)
             .toEqual({
               "description":
                   {"id": "someId", "description": {"a": 2}, "metrics": {"script": "script time"}},
               "completeSample": [
                 {
                   "timeStamp": "1970-01-01T00:00:00.000Z",
                   "runIndex": 0,
                   "values": {"a": 3, "b": 6}
                 }
               ],
               "validSample": [
                 {
                   "timeStamp": "1970-01-01T00:00:00.000Z",
                   "runIndex": 0,
                   "values": {"a": 3, "b": 6}
                 },
                 {
                   "timeStamp": "1970-01-01T00:00:00.001Z",
                   "runIndex": 1,
                   "values": {"a": 5, "b": 9}
                 }
               ]
             });
         async.done();
       }));

  });
}

function mv(runIndex, time, values) {
  return new MeasureValues(runIndex, DateWrapper.fromMillis(time), values);
}
