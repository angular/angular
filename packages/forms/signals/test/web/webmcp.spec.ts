/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license block that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, Component, input, linkedSignal, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, provideExperimentalWebMcpForms, required} from '@angular/forms/signals';
import {cleanupWebMCPPolyfill, initializeWebMCPPolyfill} from '@mcp-b/webmcp-polyfill';

describe('Signal Forms WebMCP Integration', () => {
  beforeEach(() => {
    initializeWebMCPPolyfill({installTestingShim: true});
  });

  afterEach(() => {
    cleanupWebMCPPolyfill();
  });

  describe('with provideWebMcpForms() provided', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideExperimentalWebMcpForms()],
      });
    });

    it('should infer schema and register form as a tool', async () => {
      const model = signal({
        name: 'John',
        age: 30,
        isActive: true,
        hobbies: ['reading', 'coding'],
        address: {
          city: 'Sunnyvale',
          zip: 94089,
        },
      });

      TestBed.runInInjectionContext(() => {
        form(model, {
          experimentalWebMcpTool: {
            name: 'testFormTool',
            description: 'A test form tool',
          },
        });
      });
      await TestBed.inject(ApplicationRef).whenStable();

      const registeredTools = globalThis.navigator.modelContextTesting!.listTools();
      expect(registeredTools[0].name).toBe('testFormTool');
      expect(registeredTools[0].description).toBe('A test form tool');
      expect(JSON.parse(registeredTools[0].inputSchema!)).toEqual({
        type: 'object',
        properties: {
          name: {type: 'string'},
          age: {type: 'number'},
          isActive: {type: 'boolean'},
          hobbies: {
            type: 'array',
            items: {type: 'string'},
          },
          address: {
            type: 'object',
            properties: {
              city: {type: 'string'},
              zip: {type: 'number'},
            },
            required: [],
            additionalProperties: false,
          },
        },
        required: [],
        additionalProperties: false,
      });
    });

    it('should infer required validators in schema', async () => {
      const model = signal({
        name: 'John',
        age: 30,
        address: {
          city: 'Sunnyvale',
          zip: 94089,
        },
      });

      TestBed.runInInjectionContext(() => {
        form(
          model,
          (p) => {
            required(p.name);
            required(p.address.city);
          },
          {
            experimentalWebMcpTool: {
              name: 'requiredTestTool',
              description: 'A test for required validators',
            },
          },
        );
      });
      await TestBed.inject(ApplicationRef).whenStable();

      const registeredTools = globalThis.navigator.modelContextTesting!.listTools();
      const tool = registeredTools.find((t) => t.name === 'requiredTestTool')!;
      expect(JSON.parse(tool.inputSchema!)).toEqual({
        type: 'object',
        properties: {
          name: {type: 'string'},
          age: {type: 'number'},
          address: {
            type: 'object',
            properties: {
              city: {type: 'string'},
              zip: {type: 'number'},
            },
            required: ['city'],
            additionalProperties: false,
          },
        },
        required: ['name'],
        additionalProperties: false,
      });
    });

    it('should fill out and submit the form successfully', async () => {
      const model = signal({
        name: '',
        age: 0,
      });

      const submitSpy = jasmine.createSpy('submitSpy').and.returnValue(Promise.resolve(undefined));

      TestBed.runInInjectionContext(() => {
        form(model, {
          experimentalWebMcpTool: {
            name: 'testFormSubmitTool',
            description: 'A test form submit tool',
          },
          submission: {
            action: submitSpy,
          },
        });
      });
      await TestBed.inject(ApplicationRef).whenStable();

      const result = await globalThis.navigator.modelContextTesting!.executeTool(
        'testFormSubmitTool',
        JSON.stringify({
          name: 'Alice',
          age: 25,
        }),
      );

      // Should update raw data model.
      expect(model()).toEqual({
        name: 'Alice',
        age: 25,
      });

      expect(submitSpy).toHaveBeenCalledTimes(1);
      expect(JSON.parse(result!)).toEqual({
        content: [{type: 'text', text: 'Form submitted successfully.'}],
      });
    });

    it('should return a failure message if form validation fails', async () => {
      const model = signal({name: {first: ''}});

      TestBed.runInInjectionContext(() => {
        form(
          model,
          (p) => {
            required(p.name.first, {message: 'First name is required'});
          },
          {
            experimentalWebMcpTool: {
              name: 'testFormInvalidTool',
              description: 'A validation test tool',
            },
            submission: {
              action: async () => undefined,
            },
          },
        );
      });
      await TestBed.inject(ApplicationRef).whenStable();

      const result = await globalThis.navigator.modelContextTesting!.executeTool(
        'testFormInvalidTool',
        JSON.stringify({name: {first: ''}}),
      );

      expect(JSON.parse(result!)).toEqual({
        content: [
          {
            type: 'text',
            text: jasmine.stringContaining('name.first: First name is required'),
          },
        ],
      });
    });

    it('should return a failure message if the submit action fails', async () => {
      const model = signal({name: ''});

      TestBed.runInInjectionContext(() => {
        form(model, {
          experimentalWebMcpTool: {
            name: 'testFormSubmitFailTool',
            description: 'A submit fail test tool',
          },
          submission: {
            action: async () => {
              return {
                kind: 'submit-failed',
                message: 'Database write failed',
              };
            },
          },
        });
      });
      await TestBed.inject(ApplicationRef).whenStable();

      const result = await globalThis.navigator.modelContextTesting!.executeTool(
        'testFormSubmitFailTool',
        JSON.stringify({name: ''}),
      );

      expect(JSON.parse(result!)).toEqual({
        content: [
          {
            type: 'text',
            text: jasmine.stringContaining('Database write failed'),
          },
        ],
      });
    });

    it('should throw an error if the submit action throws an error', async () => {
      const model = signal({name: ''});

      TestBed.runInInjectionContext(() => {
        form(model, {
          experimentalWebMcpTool: {
            name: 'testFormSubmitErrorTool',
            description: 'A submit error test tool',
          },
          submission: {
            action: async () => {
              throw new Error('Database connection lost');
            },
          },
        });
      });
      await TestBed.inject(ApplicationRef).whenStable();

      await expectAsync(
        globalThis.navigator.modelContextTesting!.executeTool(
          'testFormSubmitErrorTool',
          JSON.stringify({name: ''}),
        ),
      ).toBeRejectedWithError(/Database connection lost/);
    });

    it('should throw an error if schema cannot be inferred accurately', () => {
      // 1. Null value
      TestBed.runInInjectionContext(() => {
        expect(() => {
          form(signal({value: null}), {
            experimentalWebMcpTool: {
              name: 'nullTool',
              description: 'A null tool',
            },
          });
          TestBed.inject(ApplicationRef).tick();
        }).toThrowError(/Could not accurately infer WebMCP schema/);
      });
      expect(
        globalThis.navigator.modelContextTesting!.listTools().some((t) => t.name === 'nullTool'),
      ).toBeFalse();

      // 2. Empty array value
      TestBed.runInInjectionContext(() => {
        expect(() => {
          form(signal({value: [] as string[]}), {
            experimentalWebMcpTool: {
              name: 'emptyArrayTool',
              description: 'An empty array tool',
            },
          });
          TestBed.inject(ApplicationRef).tick();
        }).toThrowError(/Could not accurately infer WebMCP schema/);
      });
      expect(
        globalThis.navigator
          .modelContextTesting!.listTools()
          .some((t) => t.name === 'emptyArrayTool'),
      ).toBeFalse();

      // 3. Unsupported type (symbol)
      TestBed.runInInjectionContext(() => {
        expect(() => {
          form(signal({value: Symbol('test')}), {
            experimentalWebMcpTool: {
              name: 'symbolTool',
              description: 'A symbol tool',
            },
          });
          TestBed.inject(ApplicationRef).tick();
        }).toThrowError(/Could not accurately infer WebMCP schema/);
      });
      expect(
        globalThis.navigator.modelContextTesting!.listTools().some((t) => t.name === 'symbolTool'),
      ).toBeFalse();
    });

    it('should not throw an error when reading the model', async () => {
      @Component({
        selector: 'app-root',
        template: ``,
      })
      class App {
        id = input.required<string>();
        model = linkedSignal(() => ({id: this.id()}));

        form = form(this.model, () => {}, {
          experimentalWebMcpTool: {description: 'foo', name: 'foo'},
        });
      }

      await TestBed.inject(ApplicationRef).whenStable();
      expect(() => TestBed.createComponent(App)).not.toThrow();
    });
  });

  it('should throw an error if `experimentalWebMcpTool` is configured but `provideWebMcpForms` was not', () => {
    const model = signal({name: ''});

    TestBed.runInInjectionContext(() => {
      expect(() => {
        form(model, {
          experimentalWebMcpTool: {
            name: 'orphanTool',
            description: 'An orphan tool with no registry provided',
          },
        });
      }).toThrowError(/Cannot register form "orphanTool"/);
    });
  });
});
