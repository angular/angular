import {Directive, onAllChangesDone, Attribute, Parent} from 'angular2/angular2';

import {ObservableWrapper, EventEmitter} from 'angular2/src/facade/async';

// TODO(jelbourn): validation (will depend on Forms API).
// TODO(jelbourn): textarea resizing
// TODO(jelbourn): max-length counter
// TODO(jelbourn): placeholder property

@Directive({
  selector: 'md-input-container',
  lifecycle: [onAllChangesDone],
  host:
      {'[class.md-input-has-value]': 'inputHasValue', '[class.md-input-focused]': 'inputHasFocus'}
})
export class MdInputContainer {
  // The MdInput or MdTextarea inside of this container.
  _input: MdInput;

  // Whether the input inside of this container has a non-empty value.
  inputHasValue: boolean;

  // Whether the input inside of this container has focus.
  inputHasFocus: boolean;

  constructor(@Attribute('id') id: string) {
    this._input = null;
    this.inputHasValue = false;
    this.inputHasFocus = false;
  }

  onAllChangesDone() {
    // Enforce that this directive actually contains a text input.
    if (this._input == null) {
      throw 'No <input> or <textarea> found inside of <md-input-container>';
    }
  }

  /** Registers the child MdInput or MdTextarea. */
  registerInput(input) {
    if (this._input != null) {
      throw 'Only one text input is allowed per <md-input-container>.';
    }

    this._input = input;
    this.inputHasValue = input.value != '';

    // Listen to input changes and focus events so that we can apply the appropriate CSS
    // classes based on the input state.
    ObservableWrapper.subscribe(input.mdChange, value => { this.inputHasValue = value != ''; });

    ObservableWrapper.subscribe(input.mdFocusChange, hasFocus => {this.inputHasFocus = hasFocus});
  }
}


@Directive({
  selector: 'md-input-container input',
  events: ['mdChange', 'mdFocusChange'],
  host: {
    '[class.md-input]': 'yes',
    '(input)': 'updateValue($event)',
    '(focus)': 'setHasFocus(true)',
    '(blur)': 'setHasFocus(false)'
  }
})
export class MdInput {
  value: string;
  yes: boolean;

  // Events emitted by this directive. We use these special 'md-' events to communicate
  // to the parent MdInputContainer.
  mdChange: EventEmitter;
  mdFocusChange: EventEmitter;

  constructor(@Attribute('value') value: string, @Parent() container: MdInputContainer,
              @Attribute('id') id: string) {
    // TODO(jelbourn): Remove this when #1402 is done.
    this.yes = true;

    this.value = value == null ? '' : value;
    this.mdChange = new EventEmitter();
    this.mdFocusChange = new EventEmitter();

    container.registerInput(this);
  }

  updateValue(event) {
    this.value = event.target.value;
    ObservableWrapper.callNext(this.mdChange, this.value);
  }

  setHasFocus(hasFocus: boolean) {
    ObservableWrapper.callNext(this.mdFocusChange, hasFocus);
  }
}

/*
@Directive({
  selector: 'md-input-container textarea',
  events: ['mdChange', 'mdFocusChange'],
  hostProperties: {
    'yes': 'class.md-input'
  },
  hostListeners: {
    'input': 'updateValue($event)',
    'focus': 'setHasFocus(true)',
    'blur': 'setHasFocus(false)'
  }
})
export class MdTextarea extends MdInput {
  constructor(
      @Attribute('value') value: string,
      @Parent() container: MdInputContainer,
      @Attribute('id') id: string) {
    super(value, container, id);
  }
}
*/
