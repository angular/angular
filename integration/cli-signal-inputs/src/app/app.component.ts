import {ChangeDetectionStrategy, Component} from '@angular/core';

import {GreetComponent} from './greet.component';

@Component({
  standalone: true,
  selector: 'app-root',
  template: `
    <greet [firstName]="firstName" [lastName]="lastName" />

    <button (click)="lastName = 'Doe'">Set last name</button>
  `,
  imports: [GreetComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  firstName = 'John';
  lastName: string|undefined = undefined;
}
