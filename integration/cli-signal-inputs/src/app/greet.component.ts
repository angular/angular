import {ChangeDetectionStrategy, Component, input} from '@angular/core';

@Component({
  selector: 'greet',
  template: `{{firstName()}} - {{lastName() ?? 'unset'}}`,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GreetComponent {
  firstName = input.required<string>();
  lastName = input(undefined, {
    transform: (v: string) => `ng-${v}`,
  });
}
