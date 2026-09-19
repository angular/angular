/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license block that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, Component, input, linkedSignal, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  disabled,
  form,
  hidden,
  provideExperimentalWebMcpForms,
  readonly,
  required,
} from '@angular/forms/signals';
import {cleanupWebMCPPolyfill, initializeWebMCPPolyfill} from '@mcp-b/webmcp-polyfill';
import type {ChromeModelContextExtensions, ModelContext} from '@mcp-b/webmcp-types';
import {REGISTER_WEBMCP_FORM, RegisterWebMcpForm} from '../../src/webmcp/tokens';

describe('Signal Forms WebMCP Integration', () => {
  beforeEach(() => {
    // Firefox throws a security error with this.
    Object.defineProperty(globalThis, 'originAgentCluster', {
      value: true,
      configurable: true,
    });
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

      const modelContext = (globalThis.document as any).modelContext;
      const registerSpy = spyOn(modelContext, 'registerTool').and.callThrough();

      TestBed.runInInjectionContext(() => {
        form(model, {
          experimentalWebMcpTool: {
            name: 'testFormTool',
            description: 'A test form tool',
          },
        });
      });
      await TestBed.inject(ApplicationRef).whenStable();

      expect(registerSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          annotations: {
            readOnlyHint: false,
            untrustedContentHint: false,
          },
        }),
        jasmine.anything(),
      );

      const registeredTools = await getModelContext().getTools();
      expect(registeredTools[0].name).toBe('testFormTool');
      expect(registeredTools[0].description).toBe('A test form tool');
      expect(registeredTools[0].inputSchema).toEqual({
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

      const registeredTools = await getModelContext().getTools();
      const tool = registeredTools.find((t) => t.name === 'requiredTestTool')!;
      expect(tool.inputSchema).toEqual({
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

    it('should not expose hidden, disabled, or readonly fields in the schema', async () => {
      const model = signal({
        name: 'John',
        secret: 'hidden-value',
        plan: 'free',
        id: 'abc-123',
      });

      TestBed.runInInjectionContext(() => {
        form(
          model,
          (p) => {
            hidden(p.secret);
            disabled(p.plan);
            readonly(p.id);
          },
          {
            experimentalWebMcpTool: {
              name: 'nonWritableSchemaTool',
              description: 'A test for non-writable fields',
            },
          },
        );
      });
      await TestBed.inject(ApplicationRef).whenStable();

      const registeredTools = await getModelContext().getTools();
      const tool = registeredTools.find((t) => t.name === 'nonWritableSchemaTool')!;
      expect(tool.inputSchema).toEqual({
        type: 'object',
        properties: {
          name: {type: 'string'},
        },
        required: [],
        additionalProperties: false,
      });
    });

    it('should preserve the value of hidden, disabled, and readonly fields written by an agent', async () => {
      const model = signal({
        name: '',
        secret: 'hidden-value',
        plan: 'free',
        id: 'abc-123',
      });

      TestBed.runInInjectionContext(() => {
        form(
          model,
          (p) => {
            hidden(p.secret);
            disabled(p.plan);
            readonly(p.id);
          },
          {
            experimentalWebMcpTool: {
              name: 'nonWritableSubmitTool',
              description: 'A test for non-writable fields',
            },
            submission: {
              action: async () => undefined,
            },
          },
        );
      });
      await TestBed.inject(ApplicationRef).whenStable();

      // An agent may ignore the advertised schema and send these fields anyway.
      const result = await executeTool(
        'nonWritableSubmitTool',
        JSON.stringify({
          name: 'Alice',
          secret: 'leaked',
          plan: 'enterprise',
          id: 'tampered',
        }),
      );

      expect(model()).toEqual({
        name: 'Alice',
        secret: 'hidden-value',
        plan: 'free',
        id: 'abc-123',
      });
      expect(JSON.parse(result!)).toEqual({
        content: [{type: 'text', text: 'Form submitted successfully.'}],
      });
    });

    it('should preserve non-writable fields nested in an object', async () => {
      const model = signal({
        address: {
          city: '',
          country: 'US',
        },
      });

      TestBed.runInInjectionContext(() => {
        form(
          model,
          (p) => {
            disabled(p.address.country);
          },
          {
            experimentalWebMcpTool: {
              name: 'nestedNonWritableTool',
              description: 'A test for nested non-writable fields',
            },
            submission: {
              action: async () => undefined,
            },
          },
        );
      });
      await TestBed.inject(ApplicationRef).whenStable();

      const registeredTools = await getModelContext().getTools();
      const tool = registeredTools.find((t) => t.name === 'nestedNonWritableTool')!;
      expect(tool.inputSchema).toEqual({
        type: 'object',
        properties: {
          address: {
            type: 'object',
            properties: {city: {type: 'string'}},
            required: [],
            additionalProperties: false,
          },
        },
        required: [],
        additionalProperties: false,
      });

      await executeTool(
        'nestedNonWritableTool',
        JSON.stringify({address: {city: 'Sunnyvale', country: 'FR'}}),
      );

      expect(model()).toEqual({address: {city: 'Sunnyvale', country: 'US'}});
    });

    it('should infer a schema when only a non-writable field has an uninferable type', async () => {
      const model = signal<{name: string; metadata: string | null}>({
        name: 'John',
        metadata: null,
      });

      TestBed.runInInjectionContext(() => {
        form(
          model,
          (p) => {
            hidden(p.metadata);
          },
          {
            experimentalWebMcpTool: {
              name: 'uninferableHiddenTool',
              description: 'A test for uninferable non-writable fields',
            },
          },
        );
      });
      await TestBed.inject(ApplicationRef).whenStable();

      const registeredTools = await getModelContext().getTools();
      const tool = registeredTools.find((t) => t.name === 'uninferableHiddenTool')!;
      expect(tool.inputSchema).toEqual({
        type: 'object',
        properties: {name: {type: 'string'}},
        required: [],
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

      const result = await executeTool(
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

      const result = await executeTool('testFormInvalidTool', JSON.stringify({name: {first: ''}}));

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

      const result = await executeTool('testFormSubmitFailTool', JSON.stringify({name: ''}));

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
        executeTool('testFormSubmitErrorTool', JSON.stringify({name: ''})),
      ).toBeRejectedWithError(/Database connection lost/);
    });

    it('should throw an error if schema cannot be inferred accurately', async () => {
      const registerWebMcpForm = TestBed.inject<RegisterWebMcpForm>(REGISTER_WEBMCP_FORM);
      // 1. Null value
      await expectAsync(
        TestBed.runInInjectionContext(() => {
          const promise = registerWebMcpForm(form(signal({value: null})), {
            name: 'nullTool',
            description: 'A null tool',
          });
          TestBed.inject(ApplicationRef).tick();
          return promise;
        }),
      ).toBeRejectedWithError(/Could not accurately infer WebMCP schema/);
      expect((await getModelContext()!.getTools()).some((t) => t.name === 'nullTool')).toBeFalse();

      // 2. Empty array value
      await expectAsync(
        TestBed.runInInjectionContext(() => {
          const promise = registerWebMcpForm(form(signal({value: [] as string[]})), {
            name: 'emptyArrayTool',
            description: 'An empty array tool',
          });
          TestBed.inject(ApplicationRef).tick();
          return promise;
        }),
      ).toBeRejectedWithError(/Could not accurately infer WebMCP schema/);
      expect(
        (await getModelContext().getTools()).some((t) => t.name === 'emptyArrayTool'),
      ).toBeFalse();

      // 3. Unsupported type (symbol)
      await expectAsync(
        TestBed.runInInjectionContext(() => {
          const promise = registerWebMcpForm(form(signal({value: Symbol('test')})), {
            name: 'symbolTool',
            description: 'A symbol tool',
          });
          TestBed.inject(ApplicationRef).tick();
          return promise;
        }),
      ).toBeRejectedWithError(/Could not accurately infer WebMCP schema/);
      expect((await getModelContext().getTools()).some((t) => t.name === 'symbolTool')).toBeFalse();
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

function getModelContext(): ModelContext & ChromeModelContextExtensions {
  // Because we use the 3p types, we need to cast the document.
  return globalThis.document.modelContext!;
}

async function executeTool(toolName: string, args: string) {
  const toolsForSubmit = await getModelContext().getTools();
  const testFormSubmitTool = toolsForSubmit.find((t) => t.name === toolName)!;
  return getModelContext().executeTool!(testFormSubmitTool, args);
}
