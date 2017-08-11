///// Ideal way to write component with mixins ////////

import { Component  } from '@angular/core';
import { dgMixinDefault, fooMixin, lcHookMixin } from './mixins';

// Chain mixin functions for the component to be extended
const demoMix = fooMixin(lcHookMixin(dgMixinDefault));

@Component({
  selector: 'mixed-comp',
  template: `
    <h2>MixedComponent {{name}}</h2>
    <p>Foo() says {{foo()}}</p>
    <data-grid></data-grid>
  `
})
// Inherit from mixin
export class MixedComponent extends demoMix {
  name = 'Bob Mix';
}
