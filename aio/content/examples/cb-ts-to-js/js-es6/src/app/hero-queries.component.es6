import {
  Component,
  ContentChild,
  Input,
  QueryList,
  ViewChildren
} from '@angular/core';

export class ContentChildComponent {
  constructor() {
    this.active = false;
  }

  activate() {
    this.active = !this.active;
  }
}

ContentChildComponent.annotations = [
  new Component({
    selector: 'content-child',
    template: `
    <span class="content-child" *ngIf="active">
      Active
    </span>`
  })
];

////////////////////

// #docregion content
export class ViewChildComponent {
  constructor() {
    this.active = false;
  }

  activate() {
    this.active = !this.active;
    this.content.activate();
  }
}

ViewChildComponent.annotations = [
  new Component({
    selector: 'view-child',
    template: `<h2 [class.active]=active>
      {{hero.name}}
      <ng-content></ng-content>
    </h2>`,
    styles: ['.active {font-weight: bold; background-color: skyblue;}'],
    inputs: ['hero'],
    queries: {
      content: new ContentChild(ContentChildComponent)
    }
  })
];
// #enddocregion content

////////////////////

// #docregion view
export class HeroQueriesComponent {
  constructor(){
    this.active = false;
    this.heroData = [
      {id: 1, name: 'Windstorm'},
      {id: 2, name: 'LaughingGas'}
    ];
  }

  activate() {
    this.active = !this.active;
    this.views.forEach(
      view => view.activate()
    );
  }

  get buttonLabel() {
    return this.active ? 'Deactivate' : 'Activate';
  }
}

HeroQueriesComponent.annotations = [
  new Component({
    selector: 'hero-queries',
    template: `
      <view-child *ngFor="let hero of heroData" [hero]="hero">
        <content-child></content-child>
      </view-child>
      <button (click)="activate()">{{buttonLabel}} All</button>
    `,
    queries: {
      views: new ViewChildren(ViewChildComponent)
    }
  })
];
// #enddocregion view
