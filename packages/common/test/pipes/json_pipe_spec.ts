/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule, JsonPipe} from '../../index';
import {Component} from '@angular/core';
import {TestBed, waitForAsync} from '@angular/core/testing';
import {expect} from '@angular/private/testing/matchers';

describe('JsonPipe', () => {
  const regNewLine = '\n';
  let inceptionObj: any;
  let inceptionObjString: string;
  let pipe: JsonPipe;

  function normalize(obj: string): string {
    return obj.replace(regNewLine, '');
  }

  beforeEach(() => {
    inceptionObj = {dream: {dream: {dream: 'Limbo'}}};
    inceptionObjString =
      '{\n' +
      '  "dream": {\n' +
      '    "dream": {\n' +
      '      "dream": "Limbo"\n' +
      '    }\n' +
      '  }\n' +
      '}';

    pipe = new JsonPipe();
  });

  describe('transform', () => {
    it('should return JSON-formatted string', () => {
      expect(pipe.transform(inceptionObj)).toEqual(inceptionObjString);
    });

    it('should return JSON-formatted string even when normalized', () => {
      const dream1 = normalize(pipe.transform(inceptionObj));
      const dream2 = normalize(inceptionObjString);
      expect(dream1).toEqual(dream2);
    });

    it('should return JSON-formatted string similar to Json.stringify', () => {
      const dream1 = normalize(pipe.transform(inceptionObj));
      const dream2 = normalize(JSON.stringify(inceptionObj, null, 2));
      expect(dream1).toEqual(dream2);
    });
  });

  describe('integration', () => {
    @Component({
      selector: 'test-comp',
      template: '{{data | json}}',
      standalone: false,
    })
    class TestComp {
      data: any;
    }

    beforeEach(() => {
      TestBed.configureTestingModule({declarations: [TestComp], imports: [CommonModule]});
    });

    it('should work with mutable objects', waitForAsync(() => {
      const fixture = TestBed.createComponent(TestComp);
      const mutable: number[] = [1];
      fixture.componentInstance.data = mutable;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText('[\n  1\n]');

      mutable.push(2);
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText('[\n  1,\n  2\n]');
    }));
  });

  it('should be available as a standalone pipe', () => {
    @Component({
      selector: 'test-component',
      imports: [JsonPipe],
      template: '{{ value | json }}',
    })
    class TestComponent {
      value = {'a': 1};
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const content = fixture.nativeElement.textContent;
    expect(content.replace(/\s/g, '')).toBe('{"a":1}');
  });
});
