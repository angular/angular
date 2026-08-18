/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  declareExperimentalWebMcpTool,
  Directive,
  inject,
  Injector,
  input,
  OnInit,
} from '@angular/core';

import {AbstractControl} from '../../model/abstract_model';
import {FormArray} from '../../model/form_array';
import {FormGroup} from '../../model/form_group';
import {Validators} from '../../validators';

import {FormGroupDirective} from './form_group_directive';

function inferSchemaFromControl(control: AbstractControl): any {
  if (control instanceof FormGroup) {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    Object.keys(control.controls).forEach((key) => {
      const child = control.controls[key];
      const childSchema = inferSchemaFromControl(child);
      if (childSchema) {
        properties[key] = childSchema;
        if (child.hasValidator && child.hasValidator(Validators.required)) {
          required.push(key);
        }
      }
    });

    return {
      type: 'object',
      properties,
      required,
      additionalProperties: false,
    };
  }

  if (control instanceof FormArray) {
    if (control.length > 0) {
      const itemSchema = inferSchemaFromControl(control.at(0));
      return {
        type: 'array',
        items: itemSchema,
      };
    }
    return {
      type: 'array',
      items: {type: 'string'},
    };
  }

  // FormControl
  const val = control.value;
  let type = 'string';
  if (typeof val === 'number') {
    type = 'number';
  } else if (typeof val === 'boolean') {
    type = 'boolean';
  }
  return {type};
}

function getControlErrors(control: AbstractControl, path: string[] = []): string[] {
  const errors: string[] = [];

  if (control.errors) {
    errors.push(`${path.join('.') || 'form'}: ${JSON.stringify(control.errors)}`);
  }

  if (control instanceof FormGroup) {
    Object.keys(control.controls).forEach((key) => {
      const child = control.controls[key];
      errors.push(...getControlErrors(child, [...path, key]));
    });
  } else if (control instanceof FormArray) {
    control.controls.forEach((child, index) => {
      errors.push(...getControlErrors(child, [...path, index.toString()]));
    });
  }

  return errors;
}

/**
 * @description
 *
 * Directive that automatically exposes an existing `FormGroup` to WebMCP,
 * allowing browser-side AI assistants to query the form schema, validate values,
 * and submit the form programmatically.
 *
 * @usageNotes
 *
 * ```html
 * <form [formGroup]="loginForm" webMcpForm="login" webMcpDescription="Submit login form">
 *   ...
 * </form>
 * ```
 *
 * @publicApi
 * @experimental
 */
@Directive({
  selector: '[formGroup][webMcpForm]',
  standalone: true,
})
export class WebMcpFormDirective implements OnInit {
  /**
   * The name of the WebMCP tool. This must be a unique, alphanumeric identifier.
   */
  readonly name = input.required<string>({alias: 'webMcpForm'});

  /**
   * The description of the WebMCP tool, explaining to the AI agent what the form does.
   */
  readonly webMcpDescription = input<string | undefined>(undefined);

  private readonly formGroupDirective = inject(FormGroupDirective, {self: true});
  private readonly injector = inject(Injector);

  ngOnInit() {
    if (!this.name()) {
      throw new Error('WebMcpFormDirective: [webMcpForm] requires a non-empty name.');
    }

    const form = this.formGroupDirective.form;

    declareExperimentalWebMcpTool(
      {
        name: this.name(),
        description: this.webMcpDescription() ?? `Fills and submits the form: ${this.name()}`,
        inputSchema: inferSchemaFromControl(form),
        execute: async (args: Record<string, any>) => {
          form.patchValue(args);
          form.markAllAsTouched();

          if (form.invalid) {
            const errors = getControlErrors(form);
            return {
              content: [
                {
                  type: 'text',
                  text: `Form validation failed:\n${errors.join('\n')}`,
                },
              ],
            };
          }

          // Emit ngSubmit event
          this.formGroupDirective.onSubmit(new Event('submit'));

          return {
            content: [
              {
                type: 'text',
                text: 'Form submitted successfully.',
              },
            ],
          };
        },
      },
      this.injector,
    );
  }
}
