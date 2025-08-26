import {Component, Directive} from '@angular/core';

@Directive({
  selector: '[any-structural-directive]',
  standalone: true,
})
export class AnyStructuralDirective {}


@Component({
    selector: 'my-component',
    imports: [AnyStructuralDirective],
    standalone: true,
    template: `
    <div>
      <p *any-structural-directive animate.enter="slide">Sliding Content</p>
    </div>
  `,
})
export class MyComponent {
}
