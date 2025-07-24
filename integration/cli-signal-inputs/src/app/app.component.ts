import {ChangeDetectionStrategy, Component, viewChildren} from '@angular/core';

import {GreetComponent} from './greet.component';

@Component({
  standalone: true,
  selector: 'app-root',
  template: `
    <greet [firstName]="firstName" [lastName]="lastName" [decoratorInput]="10" />

    <p>Unbound last name</p>
    <greet class="unbound-last-name" [firstName]="firstName" (clickFromInside)="$event.charAt(0)"
                                     (clickFromInside2)="$event.toExponential(2)"/>

    <button class="set-last-name-btn" (click)="lastName = 'Doe'">Set last name</button>
    <button class="unset-last-name-btn" (click)="lastName = undefined">Unset last name</button>

    <p id="greet-count">Greet component count: {{greets().length}}</p>
  `,
  imports: [GreetComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  firstName = 'John';
  lastName: string | undefined = undefined;

  greets = viewChildren(GreetComponent);
}
