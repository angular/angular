import {ChangeDetectionStrategy, Component, Input, input, ɵoutput} from '@angular/core';

@Component({
  selector: 'greet',
  template: `
    <span class="greet-text">{{firstName()}} - {{lastName() ?? 'initial-unset'}}</span>

    <button (click)="dispatchOutputEvent()"><button>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GreetComponent {
  firstName = input.required<string>();
  lastName = input(undefined, {
    transform: (v?: string) => v === undefined ? 'transformed-fallback' : `ng-${v}`,
  });

  @Input() decoratorInput = 0;

  clickFromInside = ɵoutput();

  dispatchOutputEvent() {
    this.clickFromInside.emit();
  }
}
