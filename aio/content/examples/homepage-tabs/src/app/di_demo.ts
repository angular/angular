// #docregion
import { Component } from '@angular/core';

class Detail {
  title: string;
  text: string;
}

@Component({
  selector: 'di-demo',
  template: `
    <h4>Tabs Demo</h4>
    <ui-tabs>
      <template uiPane title='Overview' active="true">
        You have {{details.length}} details.
      </template>
      <template *ngFor="let detail of details" uiPane [title]="detail.title">
        {{detail.text}} <br><br>
        <button class="btn" (click)="removeDetail(detail)">Remove</button>
      </template>
      <template uiPane title='Summary'>
        Next last ID is {{id}}.
      </template>
    </ui-tabs>
    <hr>
    <button class="btn" (click)="addDetail()">Add Detail</button>
    `
})
export class DiDemoComponent {
  details: Detail[] = [];
  id: number = 0;

  addDetail() {
    this.id++;
    this.details.push({
      title: `Detail ${this.id}`,
      text: `Some detail text for ${this.id}...`
    });
  }

  removeDetail(detail: Detail) {
    this.details = this.details.filter((d) => d !== detail);
  }
}

