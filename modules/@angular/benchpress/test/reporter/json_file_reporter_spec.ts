/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncTestCompleter, describe, expect, inject, it} from '@angular/core/testing/testing_internal';

import {JsonFileReporter, MeasureValues, Options, ReflectiveInjector, SampleDescription} from '../../index';
import {Json, isPresent} from '../../src/facade/lang';

export function main() {
  describe('file reporter', () => {
    var loggedFile: any;

    function createReporter({sampleId, descriptions, metrics, path}: {
      sampleId: string,
      descriptions: {[key: string]: any}[],
      metrics: {[key: string]: string},
      path: string
    }) {
      var providers = [
        JsonFileReporter.PROVIDERS, {
          provide: SampleDescription,
          useValue: new SampleDescription(sampleId, descriptions, metrics)
        },
        {provide: JsonFileReporter.PATH, useValue: path},
        {provide: Options.NOW, useValue: () => new Date(1234)}, {
          provide: Options.WRITE_FILE,
          useValue: (filename: string, content: string) => {
            loggedFile = {'filename': filename, 'content': content};
            return Promise.resolve(null);
          }
        }
      ];
      return ReflectiveInjector.resolveAndCreate(providers).get(JsonFileReporter);
    }

    it('should write all data into a file',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         createReporter({
           sampleId: 'someId',
           descriptions: [{'a': 2}],
           path: 'somePath',
           metrics: {'a': 'script time', 'b': 'render time'}
         })
             .reportSample(
                 [mv(0, 0, {'a': 3, 'b': 6})],
                 [mv(0, 0, {'a': 3, 'b': 6}), mv(1, 1, {'a': 5, 'b': 9})]);
         var regExp = /somePath\/someId_\d+\.json/;
         expect(isPresent(loggedFile['filename'].match(regExp))).toBe(true);
         var parsedContent = Json.parse(loggedFile['content']);
         expect(parsedContent).toEqual({
           'description': {
             'id': 'someId',
             'description': {'a': 2},
             'metrics': {'a': 'script time', 'b': 'render time'}
           },
           'stats': {'a': '4.00+-25%', 'b': '7.50+-20%'},
           'completeSample': [
             {'timeStamp': '1970-01-01T00:00:00.000Z', 'runIndex': 0, 'values': {'a': 3, 'b': 6}}
           ],
           'validSample': [
             {'timeStamp': '1970-01-01T00:00:00.000Z', 'runIndex': 0, 'values': {'a': 3, 'b': 6}}, {
               'timeStamp': '1970-01-01T00:00:00.001Z',
               'runIndex': 1,
               'values': {'a': 5, 'b': 9}
             }
           ]
         });
         async.done();
       }));

  });
}

function mv(runIndex: number, time: number, values: {[key: string]: number}) {
  return new MeasureValues(runIndex, new Date(time), values);
}
