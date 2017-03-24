/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {Subject} from 'rxjs/Subject';


// #docregion NgIfSimple
@Component({
  selector: 'ng-if-simple',
  template: `
    <button (click)="show = !show">{{show ? 'hide' : 'show'}}</button>
    show = {{show}}
    <br>
    <div *ngIf="show">Text to show</div>
`
})
class NgIfSimple {
  show: boolean = true;
}
// #enddocregion

// #docregion NgIfElse
@Component({
  selector: 'ng-if-else',
  template: `
    <button (click)="show = !show">{{show ? 'hide' : 'show'}}</button>
    show = {{show}}
    <br>
    <div *ngIf="show; else elseBlock">Text to show</div>
    <ng-template #elseBlock>Alternate text while primary text is hidden</ng-template>
`
})
class NgIfElse {
  show: boolean = true;
}
// #enddocregion

// #docregion NgIfThenElse
@Component({
  selector: 'ng-if-then-else',
  template: `
    <button (click)="show = !show">{{show ? 'hide' : 'show'}}</button>
    <button (click)="switchPrimary()">Switch Primary</button>
    show = {{show}}
    <br>
    <div *ngIf="show; then thenBlock; else elseBlock">this is ignored</div>
    <ng-template #primaryBlock>Primary text to show</ng-template>
    <ng-template #secondaryBlock>Secondary text to show</ng-template>
    <ng-template #elseBlock>Alternate text while primary text is hidden</ng-template>
`
})
class NgIfThenElse implements OnInit {
  thenBlock: TemplateRef<any>|null = null;
  show: boolean = true;

  @ViewChild('primaryBlock')
  primaryBlock: TemplateRef<any>|null = null;
  @ViewChild('secondaryBlock')
  secondaryBlock: TemplateRef<any>|null = null;

  switchPrimary() {
    this.thenBlock = this.thenBlock === this.primaryBlock ? this.secondaryBlock : this.primaryBlock;
  }

  ngOnInit() { this.thenBlock = this.primaryBlock; }
}
// #enddocregion

// #docregion NgIfAs
@Component({
  selector: 'ng-if-let',
  template: `
    <button (click)="nextUser()">Next User</button>
    <br>
    <div *ngIf="userObservable | async as user; else loading">
      Hello {{user.last}}, {{user.first}}!
    </div>
    <ng-template #loading let-user>Waiting... (user is {{user|json}})</ng-template>
`
})
class NgIfAs {
  userObservable = new Subject<{first: string, last: string}>();
  first = ['John', 'Mike', 'Mary', 'Bob'];
  firstIndex = 0;
  last = ['Smith', 'Novotny', 'Angular'];
  lastIndex = 0;

  nextUser() {
    let first = this.first[this.firstIndex++];
    if (this.firstIndex >= this.first.length) this.firstIndex = 0;
    let last = this.last[this.lastIndex++];
    if (this.lastIndex >= this.last.length) this.lastIndex = 0;
    this.userObservable.next({first, last});
  }
}
// #enddocregion


@Component({
  selector: 'example-app',
  template: `
    <ng-if-simple></ng-if-simple>
    <hr>
    <ng-if-else></ng-if-else>
    <hr>
    <ng-if-then-else></ng-if-then-else>
    <hr>
    <ng-if-let></ng-if-let>
    <hr>
`
})
class ExampleApp {
}

@NgModule({
  imports: [BrowserModule],
  declarations: [ExampleApp, NgIfSimple, NgIfElse, NgIfThenElse, NgIfAs],
  bootstrap: [ExampleApp]
})
export class AppModule {
}
