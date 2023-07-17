/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import '@angular/core/test/bundling/util/src/reflect_metadata';

import {ApplicationRef, Component, Directive, ElementRef, HostBinding, HostListener, NgModule, ɵdetectChanges as detectChanges} from '@angular/core';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';

@Directive({
  selector: '[make-color-grey]',
  exportAs: 'makeColorGrey',
  host: {'style': 'font-family: Times New Roman;'}
})
class MakeColorGreyDirective {
  @HostBinding('style.background-color') private _backgroundColor: string|null = null;
  @HostBinding('style.color') private _textColor: string|null = null;

  on() {
    this._backgroundColor = 'grey';
    this._textColor = 'black';
  }

  off() {
    this._backgroundColor = null;
    this._textColor = null;
  }

  toggle() {
    this._backgroundColor ? this.off() : this.on();
  }
}

@Component({selector: 'box-with-overridden-styles', template: '...'})
class BoxWithOverriddenStylesComponent {
  public active = false;

  @HostBinding('style') styles = {};

  constructor() {
    this.onInActive();
  }

  @HostListener('click', ['$event'])
  toggle() {
    if (this.active) {
      this.onInActive();
    } else {
      this.onActive();
    }
    detectChanges(this);
  }

  onActive() {
    this.active = true;
    this.styles = {height: '500px', 'font-size': '200px', background: 'red'};
  }

  onInActive() {
    this.active = false;
    this.styles = {width: '200px', height: '500px', border: '10px solid black', background: 'grey'};
  }
}

@Component({
  selector: 'animation-world',
  template: `
    <div class="list">
      <div
        #makeColorGrey="makeColorGrey"
        make-color-grey
        *ngFor="let item of items"
        class="record"
        [style.transform]="item.active ? 'scale(1.5)' : 'none'"
        [class]="makeClass(item)"
        style="border-radius: 10px"
        [style]="styles"
        [style.color]="item.value == 4 ? 'red' : null"
        [style.background-color]="item.value == 4 ? 'white' : null"
        (click)="toggleActive(item, makeColorGrey)">
        {{ item.value }}
      </div>
    </div>

    <hr>

    <box-with-overridden-styles
      style="display:block"
      [style]="{'border-radius':'50px', 'border': '50px solid teal'}" [ngStyle]="{transform:'rotate(50deg)'}">
    </box-with-overridden-styles>
  `,
})
class AnimationWorldComponent {
  @HostBinding('class') classVal = 'border';

  items: any[] = [
    {value: 1, active: false}, {value: 2, active: false}, {value: 3, active: false},
    {value: 4, active: false}, {value: 5, active: false}, {value: 6, active: false},
    {value: 7, active: false}, {value: 8, active: false}, {value: 9, active: false}
  ];
  private _hostElement: HTMLElement;
  public styles: {[key: string]: any}|null = null;

  constructor(element: ElementRef) {
    this._hostElement = element.nativeElement;
  }

  makeClass(item: any) {
    return `record-${item.value}`;
  }

  toggleActive(item: any, makeColorGrey: MakeColorGreyDirective) {
    item.active = !item.active;
    makeColorGrey.toggle();
    detectChanges(this);
  }
}

@NgModule({
  declarations: [AnimationWorldComponent, MakeColorGreyDirective, BoxWithOverriddenStylesComponent],
  imports: [BrowserModule],
})
class AnimationWorldModule {
  ngDoBootstrap(app: ApplicationRef) {
    app.bootstrap(AnimationWorldComponent);
  }
}

platformBrowser().bootstrapModule(AnimationWorldModule, {ngZone: 'noop'});
