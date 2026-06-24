import {Component} from '@angular/core';

import {BirthdayComponent} from './birthday.component';
import {BirthdayFormattingComponent} from './birthday-formatting.component';
import {BirthdayPipeChainingComponent} from './birthday-pipe-chaining.component';
import {FlyingHeroesComponent, FlyingHeroesImpureComponent} from './flying-heroes.component';
import {HeroAsyncMessageComponent} from './hero-async-message.component';
import {PrecedenceComponent} from './precedence.component';
import {JsonPipeComponent} from './json-pipe.component';
import {PowerBoosterComponent} from './power-booster.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    // Example components
    BirthdayComponent,
    BirthdayFormattingComponent,
    BirthdayPipeChainingComponent,
    FlyingHeroesComponent,
    FlyingHeroesImpureComponent,
    HeroAsyncMessageComponent,
    PrecedenceComponent,
    JsonPipeComponent,
    PowerBoosterComponent,
  ],
  styles: [
    'a[href] {display: block; padding: 10px 0;}',
    'a:hover {text-decoration: none;}',
    'h2 {margin: 0;}',
    'code {font-family: monospace; background-color: #eee; padding: 0.5em;}',
  ],
})
export class AppComponent {
  birthday = new Date(1988, 3, 15); // April 15, 1988 -- since month parameter is zero-based
}
