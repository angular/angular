import {ChangeDetectionStrategy, Component, Input, input} from '@angular/core';

@Component({
  selector: 'greet',
  template: `
    <span class="greet-text">{{firstName()}} - {{lastName() ?? 'initial-unset'}}</span>`,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GreetComponent {
  firstName = input.required<string>();
  lastName = input(undefined, {
    transform: (v?: string) => v === undefined ? 'transformed-fallback' : `ng-${v}`,
  });

  @Input() decoratorInput = 0;
}
