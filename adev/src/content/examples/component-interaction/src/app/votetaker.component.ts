// #docregion
import {Component} from '@angular/core';

@Component({
  selector: 'app-vote-taker',
  template: `
    <h2>Should mankind colonize the Universe?</h2>
    <h3>Agree: {{agreed}}, Disagree: {{disagreed}}</h3>
    
    @for (voter of voters; track voter) {
      <app-voter
        [name]="voter"
        (voted)="onVoted($event)">
      </app-voter>
    }
    `,
})
export class VoteTakerComponent {
  agreed = 0;
  disagreed = 0;
  voters = ['Dr. IQ', 'Celeritas', 'Bombasto'];

  onVoted(agreed: boolean) {
    if (agreed) {
      this.agreed++;
    } else {
      this.disagreed++;
    }
  }
}
// #enddocregion
