import {ChangeDetectionStrategy, Component} from '@angular/core';

import {GreetComponent} from './greet.component';

@Component({
  standalone: true,
  selector: 'app-root',
  template: `
    <greet [firstName]="firstName" [lastName]="lastName" [decoratorInput]="10" />

    <p>Unbound last name</p>
    <greet class="unbound-last-name" [firstName]="firstName" />

    <button class="set-last-name-btn" (click)="lastName = 'Doe'">Set last name</button>
    <button class="unset-last-name-btn" (click)="lastName = undefined">Unset last name</button>
  `,
  imports: [GreetComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  firstName = 'John';
  lastName: string|undefined = undefined;
}
