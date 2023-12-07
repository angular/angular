import {ChangeDetectionStrategy, Component, ɵinput} from '@angular/core';

@Component({
  selector: 'greet',
  template: `
    <span class="greet-text">{{firstName()}} - {{lastName() ?? 'initial-unset'}}</span>`,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GreetComponent {
  firstName = ɵinput.required<string>();
  lastName = ɵinput(undefined, {
    transform: (v?: string) => v === undefined ? 'transformed-fallback' : `ng-${v}`,
  });
}
