import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'hello-world-el',
  template: 'Hello {{name}}!',
})
export class HelloWorldComponent {
  @Input() name: string = 'World';
}

@Component({
  selector: 'hello-world-onpush-el',
  template: 'Hello {{name}}!',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelloWorldOnpushComponent {
  @Input() name: string = 'World';
}

@Component({
  selector: 'hello-world-shadow-el',
  template: 'Hello {{name}}!',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class HelloWorldShadowComponent {
  @Input() name: string = 'World';
}

@Component({
  selector: 'test-card',
  template: `
    <header>
      <slot name="card-header"></slot>
    </header>
    <slot></slot>
    <footer>
      <slot name="card-footer"></slot>
    </footer>`,
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class TestCardComponent {
}
