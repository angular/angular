import { Component } from '@angular/core';

import { Hero, HeroService } from './hero.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="buttons">
      <button [disabled]="!heroService.canAdd()" (click)="heroService.addInactive()">Add inactive hero</button>
      <button [disabled]="!heroService.canAdd()" (click)="heroService.addActive()">Add active hero</button>
      <button [disabled]="!heroService.canRemove()" (click)="heroService.remove()">Remove hero</button>
    </div>

    <div class="columns">
      <div class="column">
        <h4>Basic State</h4>
        <p>Switch between active/inactive on click.</p>
        <app-hero-list-basic [heroes]="heroes"></app-hero-list-basic>
      </div>
      <div class="column">
        <h4>Styles inline in transitions</h4>
        <p>Animated effect on click, no persistend end styles.</p>
        <app-hero-list-inline-styles [heroes]="heroes"></app-hero-list-inline-styles>
      </div>
      <div class="column">
        <h4>Combined transition syntax</h4>
        <p>Switch between active/inactive on click. Define just one transition used in both directions.</p>
        <app-hero-list-combined-transitions [heroes]="heroes"></app-hero-list-combined-transitions>
      </div>
      <div class="column">
        <h4>Two-way transition syntax</h4>
        <p>Switch between active/inactive on click. Define just one transition used in both directions using the <=> syntax.</p>
        <app-hero-list-twoway [heroes]="heroes"></app-hero-list-twoway>
      </div>
      <div class="column">
        <h4>Enter & Leave</h4>
        <p>Enter and leave animations using the void state.</p>
        <app-hero-list-enter-leave [heroes]="heroes"></app-hero-list-enter-leave>
      </div>
    </div>
    <div class="columns">
      <div class="column">
        <h4>Enter & Leave & States</h4>
        <p>
          Enter and leave animations combined with active/inactive state animations.
          Different enter and leave transitions depending on state.
        </p>
        <app-hero-list-enter-leave-states [heroes]="heroes"></app-hero-list-enter-leave-states>
      </div>
      <div class="column">
        <h4>Auto Style Calc</h4>
        <p>Leave animation from the current computed height using the auto-style value *.</p>
        <app-hero-list-auto [heroes]="heroes"></app-hero-list-auto>
      </div>
      <div class="column">
        <h4>Different Timings</h4>
        <p>Enter and leave animations with different easings, ease-in for enter, ease-out for leave.</p>
        <app-hero-list-timings [heroes]="heroes"></app-hero-list-timings>
      </div>
      <div class="column">
        <h4>Multiple Keyframes</h4>
        <p>Enter and leave animations with three keyframes in each, to give the transition some bounce.</p>
        <app-hero-list-multistep [heroes]="heroes"></app-hero-list-multistep>
      </div>
      <div class="column">
        <h4>Parallel Groups</h4>
        <p>Enter and leave animations with multiple properties animated in parallel with different timings.</p>
        <app-hero-list-groups [heroes]="heroes"></app-hero-list-groups>
      </div>
    </div>
  `,
  styles: [`
    .buttons {
      text-align: center;
    }
    button {
      padding: 1.5em 3em;
    }
    .columns {
      display: flex;
      flex-direction: row;
    }
    .column {
      flex: 1;
      padding: 10px;
    }
    .column p {
      min-height: 6em;
    }
  `],
  providers: [HeroService]
})
export class HeroTeamBuilderComponent {
  heroes: Hero[];

  constructor(private heroService: HeroService) {
    this.heroes = heroService.heroes;
  }
}
