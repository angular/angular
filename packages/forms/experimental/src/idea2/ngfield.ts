import {
  Directive,
  effect,
  EmbeddedViewRef,
  HOST_TAG_NAME,
  inject,
  input,
  OutputRef,
  signal,
  Signal,
  TemplateRef,
  ViewContainerRef,
  WritableSignal,
} from '@angular/core';

/**
 * Dummy impl for example purposes.
 */
export class FormField<T> {
  hidden = signal(false);
  tocuhed = signal(false);
  dirty = signal(false);

  constructor(
    public value: WritableSignal<T>,
    public label: Signal<string>,
  ) {}
}

/**
 * Interface implemented by controls that want to manage the `NgField`.
 */
export interface FormFieldControl<T> {
  change: OutputRef<T>;
  blur: OutputRef<unknown>;
}

/**
 * Directive that provides a `FormField` to controls beneath it.
 */
@Directive({
  selector: '[ngField]',
})
export class NgField<T> {
  field = input.required<FormField<T>>({alias: 'ngField'});

  template = inject(TemplateRef, {optional: true});
  viewContainer = inject(ViewContainerRef);
  view: EmbeddedViewRef<{}> | null = null;

  constructor() {
    effect(() => {
      if (!this.field().hidden()) {
        if (this.template && !this.view) {
          this.viewContainer.clear();
          this.view = this.viewContainer.createEmbeddedView(this.template, {});
        }
      } else {
        this.viewContainer.clear();
        this.view = null;
      }
    });
  }

  registerControl(control: FormFieldControl<T>) {
    control.change.subscribe((e) => {
      this.field().value.set(e);
      this.field().dirty.set(true);
      console.log('changed!');
    });
    control.blur.subscribe(() => {
      this.field().tocuhed.set(true);
      console.log('tocuhed!');
    });
  }
}

const bindings: Record<string, Record<string, (f: FormField<unknown>) => unknown>> = {
  'input': {
    'value': (f) => f.value(),
    /*
    'disabled': field.disabled(),
    'required': field.required(),
    ...
    */
  },
  'label': {
    'innerText': (f) => f.label(),
  },
};

/**
 * Directive that binds relevant props/attrs on native elements.
 */
@Directive({
  selector: 'input[ngBindField],label[ngBindField]', // + whatever else makes sense
  host: {
    '[value]': 'getBinding("value")',
    '[innerText]': 'getBinding("innerText")',
    // disabled, required, etc. bindings...
  },
})
export class NgBindField {
  tagName = inject(HOST_TAG_NAME).toLowerCase();
  ngField = inject(NgField, {optional: true});
  getBinding = (attr: string) =>
    this.ngField ? bindings[this.tagName]?.[attr]?.(this.ngField.field()) : undefined;
}
