/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule, JsonPipe} from '@angular/common';
import {Component} from '@angular/core';
import {TestBed, async} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/matchers';

import {Json, StringWrapper} from '../../src/facade/lang';

export function main() {
  describe('JsonPipe', () => {
    var regNewLine = '\n';
    var inceptionObj: any;
    var inceptionObjString: string;
    var pipe: JsonPipe;

    function normalize(obj: string): string { return StringWrapper.replace(obj, regNewLine, ''); }

    beforeEach(() => {
      inceptionObj = {dream: {dream: {dream: 'Limbo'}}};
      inceptionObjString = '{\n' +
          '  "dream": {\n' +
          '    "dream": {\n' +
          '      "dream": "Limbo"\n' +
          '    }\n' +
          '  }\n' +
          '}';


      pipe = new JsonPipe();
    });

    describe('transform', () => {
      it('should return JSON-formatted string',
         () => { expect(pipe.transform(inceptionObj)).toEqual(inceptionObjString); });

      it('should return JSON-formatted string even when normalized', () => {
        var dream1 = normalize(pipe.transform(inceptionObj));
        var dream2 = normalize(inceptionObjString);
        expect(dream1).toEqual(dream2);
      });

      it('should return JSON-formatted string similar to Json.stringify', () => {
        var dream1 = normalize(pipe.transform(inceptionObj));
        var dream2 = normalize(Json.stringify(inceptionObj));
        expect(dream1).toEqual(dream2);
      });
    });

    describe('integration', () => {

      @Component({selector: 'test-comp', template: '{{data | json}}'})
      class TestComp {
        data: any;
      }

      beforeEach(() => {
        TestBed.configureTestingModule({declarations: [TestComp], imports: [CommonModule]});
      });

      it('should work with mutable objects', async(() => {
           let fixture = TestBed.createComponent(TestComp);
           let mutable: number[] = [1];
           fixture.componentInstance.data = mutable;
           fixture.detectChanges();
           expect(fixture.nativeElement).toHaveText('[\n  1\n]');

           mutable.push(2);
           fixture.detectChanges();
           expect(fixture.nativeElement).toHaveText('[\n  1,\n  2\n]');

         }));
    });
  });
}
