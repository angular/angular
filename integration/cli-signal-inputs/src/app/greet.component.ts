import {ChangeDetectionStrategy, Component, Input, input, output} from '@angular/core';
import {outputFromObservable} from '@angular/core/rxjs-interop';
import {Subject} from 'rxjs';

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
    transform: (v?: string) => (v === undefined ? 'transformed-fallback' : `ng-${v}`),
  });

  @Input() decoratorInput = 0;

  clickFromInside = output<string>();

  private clickFromInsideInterop$ = new Subject<number>();
  clickFromInsideInterop = outputFromObservable(this.clickFromInsideInterop$, {
    alias: 'clickFromInside2',
  });

  dispatchOutputEvent() {
    this.clickFromInside.emit('someString');
    this.clickFromInsideInterop$.next(1);
  }
}
