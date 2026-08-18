/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {cleanupWebMCPPolyfill, initializeWebMCPPolyfill} from '@mcp-b/webmcp-polyfill';

@Component({
  selector: 'reactive-form-comp',
  template: `
    <form [formGroup]="formGroup" webMcpForm="testForm" webMcpDescription="Test reactive form tool">
      <input formControlName="name" />
      <input formControlName="age" />
    </form>
  `,
  standalone: false,
})
class ReactiveFormComp {
  formGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    age: new FormControl(0),
  });
}

describe('Reactive Forms WebMCP Integration', () => {
  beforeEach(() => {
    initializeWebMCPPolyfill({installTestingShim: true});
  });

  afterEach(() => {
    cleanupWebMCPPolyfill();
  });

  it('should infer schema and register form as a tool', async () => {
    TestBed.configureTestingModule({
      declarations: [ReactiveFormComp],
      imports: [ReactiveFormsModule],
    });

    const fixture = TestBed.createComponent(ReactiveFormComp);
    fixture.detectChanges();
    await fixture.whenStable();

    const registeredTools = globalThis.navigator.modelContextTesting!.listTools();
    const testTool = registeredTools.find((t) => t.name === 'testForm');
    expect(testTool).toBeDefined();
    expect(testTool!.description).toBe('Test reactive form tool');
    expect(JSON.parse(testTool!.inputSchema!)).toEqual({
      type: 'object',
      properties: {
        name: {type: 'string'},
        age: {type: 'number'},
      },
      required: ['name'],
      additionalProperties: false,
    });
  });

  it('should fill out and submit the form successfully when valid', async () => {
    TestBed.configureTestingModule({
      declarations: [ReactiveFormComp],
      imports: [ReactiveFormsModule],
    });

    const fixture = TestBed.createComponent(ReactiveFormComp);
    fixture.detectChanges();
    await fixture.whenStable();

    const submitSpy = jasmine.createSpy('submitSpy');
    fixture.componentInstance.formGroup.valueChanges.subscribe(() => {
      if (fixture.componentInstance.formGroup.valid) {
        submitSpy();
      }
    });

    const result = await globalThis.navigator.modelContextTesting!.executeTool(
      'testForm',
      JSON.stringify({
        name: 'Alice',
        age: 25,
      }),
    );

    expect(fixture.componentInstance.formGroup.value).toEqual({
      name: 'Alice',
      age: 25,
    });

    expect(JSON.parse(result!)).toEqual({
      content: [{type: 'text', text: 'Form submitted successfully.'}],
    });
  });

  it('should return validation errors if invalid', async () => {
    TestBed.configureTestingModule({
      declarations: [ReactiveFormComp],
      imports: [ReactiveFormsModule],
    });

    const fixture = TestBed.createComponent(ReactiveFormComp);
    fixture.detectChanges();
    await fixture.whenStable();

    const result = await globalThis.navigator.modelContextTesting!.executeTool(
      'testForm',
      JSON.stringify({
        name: '',
        age: 30,
      }),
    );

    expect(JSON.parse(result!)).toEqual({
      content: [
        {
          type: 'text',
          text: jasmine.stringContaining('name: {"required":true}'),
        },
      ],
    });
  });
});
