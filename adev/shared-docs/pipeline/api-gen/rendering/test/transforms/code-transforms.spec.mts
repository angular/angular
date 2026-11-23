/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  formatExtendsClause,
  getPropertyCodeLine,
  isSignalInput,
  isSignalModel,
  isSignalOutput,
  makeGenericsText,
} from '../../transforms/code-transforms.mjs';

describe('formatExtendsClause', () => {
  it('should return an empty string when extendsValue is undefined', () => {
    expect(formatExtendsClause(undefined)).toBe('');
  });

  it('should return an empty string when extendsValue is an empty array', () => {
    expect(formatExtendsClause([])).toBe('');
  });

  it('should format a single string extends value', () => {
    expect(formatExtendsClause('BaseClass')).toBe(' extends BaseClass');
  });

  it('should format a single item array', () => {
    expect(formatExtendsClause(['BaseInterface'])).toBe(' extends BaseInterface');
  });

  it('should format multiple items in an array', () => {
    expect(formatExtendsClause(['IAwesome1', 'IAwesome2', 'IAwesome3'])).toBe(
      ' extends IAwesome1, IAwesome2, IAwesome3',
    );
  });
});

describe('makeGenericsText', () => {
  it('should return an empty string if no generics are provided', () => {
    expect(makeGenericsText(undefined)).toBe('');
    expect(makeGenericsText([])).toBe('');
  });

  it('should return a single generic type without constraints or default', () => {
    const generics = [{name: 'T', constraint: undefined, default: undefined}];
    expect(makeGenericsText(generics)).toBe('<T>');
  });

  it('should handle a single generic type with a constraint', () => {
    const generics = [{name: 'T', constraint: 'string', default: undefined}];
    expect(makeGenericsText(generics)).toBe('<T extends string>');
  });

  it('should handle a single generic type with a default value', () => {
    const generics = [{name: 'T', default: 'number', constraint: undefined}];
    expect(makeGenericsText(generics)).toBe('<T = number>');
  });

  it('should handle a single generic type with both constraint and default value', () => {
    const generics = [{name: 'T', constraint: 'string', default: 'number'}];
    expect(makeGenericsText(generics)).toBe('<T extends string = number>');
  });

  it('should handle multiple generic types without constraints or defaults', () => {
    const generics = [
      {name: 'T', constraint: undefined, default: undefined},
      {name: 'U', constraint: undefined, default: undefined},
    ];
    expect(makeGenericsText(generics)).toBe('<T, U>');
  });

  it('should handle multiple generic types with constraints and defaults', () => {
    const generics = [
      {name: 'T', constraint: 'string', default: 'number'},
      {name: 'U', constraint: 'boolean', default: undefined},
      {name: 'V', default: 'any', constraint: undefined},
    ];
    expect(makeGenericsText(generics)).toBe(
      '<T extends string = number, U extends boolean, V = any>',
    );
  });

  it('should handle complex generics with mixed constraints and defaults', () => {
    const generics = [
      {name: 'A', constraint: 'string', default: undefined},
      {name: 'B', constraint: undefined, default: undefined},
      {name: 'C', default: 'number', constraint: undefined},
      {name: 'D', constraint: 'boolean', default: 'true'},
    ];
    expect(makeGenericsText(generics)).toBe(
      '<A extends string, B, C = number, D extends boolean = true>',
    );
  });
});

describe('isSignalInput (string comparison)', () => {
  it('returns true for an InputSignal-typed input member', () => {
    const member = {
      name: 'field',
      type: 'InputSignal<Field<T>>',
      memberTags: ['readonly', 'input'],
      inputAlias: 'formField',
      isRequiredInput: true,
    } as any;
    expect(isSignalInput(member)).toBe(true);
  });

  it('returns true for an InputSignalWithTransform-typed input member', () => {
    const member = {
      name: 'disabled',
      type: 'InputSignalWithTransform<boolean, unknown>',
      memberTags: ['input'],
      inputAlias: 'disabled',
      isRequiredInput: false,
    } as any;
    expect(isSignalInput(member)).toBe(true);
  });

  it('returns false for a decorator-based input (non-signal type)', () => {
    const member = {
      name: 'field',
      type: 'Field<T>',
      memberTags: ['input'],
      inputAlias: 'formField',
      isRequiredInput: false,
    } as any;
    expect(isSignalInput(member)).toBe(false);
  });

  it('returns false for an InputSignal-typed property that is not an input', () => {
    const member = {
      name: 'value',
      type: 'InputSignal<V>',
      memberTags: ['readonly'],
    } as any;
    expect(isSignalInput(member)).toBe(false);
  });
});

describe('getPropertyCodeLine (signal inputs)', () => {
  it('renders a required signal input with a differing alias', () => {
    const member = {
      name: 'field',
      type: 'InputSignal<Field<T>>',
      memberTags: ['readonly', 'input'],
      inputAlias: 'formField',
      isRequiredInput: true,
    } as any;
    expect(getPropertyCodeLine(member)).toBe(
      `readonly field = input.required<Field<T>>({alias: 'formField'});`,
    );
  });

  it('omits the alias argument when the alias matches the property name', () => {
    const member = {
      name: 'value',
      type: 'InputSignal<V>',
      memberTags: ['readonly', 'input'],
      inputAlias: 'value',
      isRequiredInput: true,
    } as any;
    expect(getPropertyCodeLine(member)).toBe(`readonly value = input.required<V>();`);
  });

  it('renders an optional signal input using input()', () => {
    const member = {
      name: 'count',
      type: 'InputSignal<number>',
      memberTags: ['readonly', 'input'],
      inputAlias: 'count',
      isRequiredInput: false,
    } as any;
    expect(getPropertyCodeLine(member)).toBe(`readonly count = input<number>();`);
  });

  it('renders an optional signal input with an alias', () => {
    const member = {
      name: 'count',
      type: 'InputSignal<number>',
      memberTags: ['input'],
      inputAlias: 'itemCount',
      isRequiredInput: false,
    } as any;
    expect(getPropertyCodeLine(member)).toBe(`count = input<number>({alias: 'itemCount'});`);
  });

  it('unwraps InputSignalWithTransform to its inner type arguments', () => {
    const member = {
      name: 'disabled',
      type: 'InputSignalWithTransform<boolean, unknown>',
      memberTags: ['readonly', 'input'],
      inputAlias: 'disabled',
      isRequiredInput: false,
    } as any;
    expect(getPropertyCodeLine(member)).toBe(`readonly disabled = input<boolean, unknown>();`);
  });
});

describe('getPropertyCodeLine (decorator members unaffected)', () => {
  it('still renders a decorator input with @Input(alias)', () => {
    const member = {
      name: 'field',
      type: 'Field<T>',
      memberTags: ['input'],
      inputAlias: 'formField',
      isRequiredInput: false,
    } as any;
    expect(getPropertyCodeLine(member)).toBe(`@Input('formField') field: Field<T>;`);
  });

  it('still renders an output with @Output(alias)', () => {
    const member = {
      name: 'change',
      type: 'EventEmitter<T>',
      memberTags: ['output'],
      outputAlias: 'valueChange',
    } as any;
    expect(getPropertyCodeLine(member)).toBe(`@Output('valueChange') change: EventEmitter<T>;`);
  });
});

describe('isSignalOutput (string comparison)', () => {
  it('returns true for an OutputEmitterRef-typed output member', () => {
    const member = {
      name: 'nameChange',
      type: 'OutputEmitterRef<string>',
      memberTags: ['readonly', 'output'],
      outputAlias: 'name',
    } as any;
    expect(isSignalOutput(member)).toBe(true);
  });

  it('returns false for a decorator-based output (EventEmitter)', () => {
    const member = {
      name: 'change',
      type: 'EventEmitter<T>',
      memberTags: ['output'],
      outputAlias: 'valueChange',
    } as any;
    expect(isSignalOutput(member)).toBe(false);
  });

  it('returns false for an `outputFromObservable()` output typed as OutputRef', () => {
    const member = {
      name: 'change',
      type: 'OutputRef<string>',
      memberTags: ['readonly', 'output'],
      outputAlias: 'change',
    } as any;
    expect(isSignalOutput(member)).toBe(false);
  });

  it('returns false for an OutputEmitterRef-typed property that is not an output', () => {
    const member = {
      name: 'emitter',
      type: 'OutputEmitterRef<string>',
      memberTags: ['readonly'],
    } as any;
    expect(isSignalOutput(member)).toBe(false);
  });
});

describe('getPropertyCodeLine (signal outputs)', () => {
  it('renders a signal output with a differing alias', () => {
    const member = {
      name: 'nameChange',
      type: 'OutputEmitterRef<string>',
      memberTags: ['readonly', 'output'],
      outputAlias: 'name',
    } as any;
    expect(getPropertyCodeLine(member)).toBe(
      `readonly nameChange = output<string>({alias: 'name'});`,
    );
  });

  it('omits the alias argument when the alias matches the property name', () => {
    const member = {
      name: 'nameChange',
      type: 'OutputEmitterRef<string>',
      memberTags: ['readonly', 'output'],
      outputAlias: 'nameChange',
    } as any;
    expect(getPropertyCodeLine(member)).toBe(`readonly nameChange = output<string>();`);
  });

  it('renders a void output', () => {
    const member = {
      name: 'onClick',
      type: 'OutputEmitterRef<void>',
      memberTags: ['output'],
      outputAlias: 'onClick',
    } as any;
    expect(getPropertyCodeLine(member)).toBe(`onClick = output<void>();`);
  });

  it('keeps nested generics intact', () => {
    const member = {
      name: 'selected',
      type: 'OutputEmitterRef<ReadonlyArray<Item<T>>>',
      memberTags: ['readonly', 'output'],
      outputAlias: 'selected',
    } as any;
    expect(getPropertyCodeLine(member)).toBe(
      `readonly selected = output<ReadonlyArray<Item<T>>>();`,
    );
  });

  it('still renders an `outputFromObservable()` output with @Output(...)', () => {
    const member = {
      name: 'change',
      type: 'OutputRef<string>',
      memberTags: ['readonly', 'output'],
      outputAlias: 'valueChange',
    } as any;
    expect(getPropertyCodeLine(member)).toBe(
      `readonly @Output('valueChange') change: OutputRef<string>;`,
    );
  });
});

describe('isSignalModel (string comparison)', () => {
  it('returns true for a ModelSignal-typed member tagged as both input and output', () => {
    const member = {
      name: 'value',
      type: 'ModelSignal<string>',
      memberTags: ['readonly', 'input', 'output'],
      inputAlias: 'value',
      outputAlias: 'valueChange',
      isRequiredInput: false,
    } as any;
    expect(isSignalModel(member)).toBe(true);
  });

  it('returns true when only one of the binding tags is present', () => {
    const asInput = {
      name: 'value',
      type: 'ModelSignal<string>',
      memberTags: ['readonly', 'input'],
      inputAlias: 'value',
    } as any;
    const asOutput = {
      name: 'value',
      type: 'ModelSignal<string>',
      memberTags: ['readonly', 'output'],
      outputAlias: 'valueChange',
    } as any;
    expect(isSignalModel(asInput)).toBe(true);
    expect(isSignalModel(asOutput)).toBe(true);
  });

  it('returns false for a ModelSignal-typed property that is neither an input nor an output', () => {
    const member = {
      name: 'value',
      type: 'ModelSignal<string>',
      memberTags: ['readonly'],
    } as any;
    expect(isSignalModel(member)).toBe(false);
  });

  it('returns false for a decorator-based two-way binding pair', () => {
    const member = {
      name: 'value',
      type: 'string',
      memberTags: ['input', 'output'],
      inputAlias: 'value',
      outputAlias: 'valueChange',
      isRequiredInput: false,
    } as any;
    expect(isSignalModel(member)).toBe(false);
  });
});

describe('getPropertyCodeLine (signal models)', () => {
  it('renders an optional model using model()', () => {
    const member = {
      name: 'value',
      type: 'ModelSignal<string>',
      memberTags: ['readonly', 'input', 'output'],
      inputAlias: 'value',
      outputAlias: 'valueChange',
      isRequiredInput: false,
    } as any;
    expect(getPropertyCodeLine(member)).toBe(`readonly value = model<string>();`);
  });

  it('renders a required model using model.required()', () => {
    const member = {
      name: 'value',
      type: 'ModelSignal<Field<T>>',
      memberTags: ['readonly', 'input', 'output'],
      inputAlias: 'value',
      outputAlias: 'valueChange',
      isRequiredInput: true,
    } as any;
    expect(getPropertyCodeLine(member)).toBe(`readonly value = model.required<Field<T>>();`);
  });

  it('passes only the input alias, since the output alias is derived from it', () => {
    const member = {
      name: 'value',
      type: 'ModelSignal<string>',
      memberTags: ['readonly', 'input', 'output'],
      inputAlias: 'modelValue',
      outputAlias: 'modelValueChange',
      isRequiredInput: false,
    } as any;
    expect(getPropertyCodeLine(member)).toBe(
      `readonly value = model<string>({alias: 'modelValue'});`,
    );
  });

  it('drops both binding tags, so neither @Input() nor @Output() is rendered', () => {
    const member = {
      name: 'value',
      type: 'ModelSignal<string>',
      memberTags: ['input', 'output'],
      inputAlias: 'value',
      outputAlias: 'valueChange',
      isRequiredInput: false,
    } as any;
    const line = getPropertyCodeLine(member);
    expect(line).toBe(`value = model<string>();`);
    expect(line).not.toContain('@Input');
    expect(line).not.toContain('@Output');
  });
});
