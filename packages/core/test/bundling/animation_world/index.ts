/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import '@angular/core/test/bundling/util/src/reflect_metadata';

import {CommonModule} from '@angular/common';
import {Component, ElementRef, NgModule, Pipe, ɵAnimatePipe as AnimatePipe, ɵPlayState as PlayState, ɵPlayer as Player, ɵPlayerFactoryBuildOptions as PlayerFactoryBuildOptions, ɵPlayerHandler as PlayerHandler, ɵaddPlayer as addPlayer, ɵbindPlayerFactory as bindPlayerFactory, ɵmarkDirty as markDirty, ɵpublishDefaultGlobalUtils, ɵrenderComponent as renderComponent} from '@angular/core';
import {Subject} from 'rxjs';

@Component({
  selector: 'animation-world',
  template: `
    <section>
      <header>
        <h2>Classes and Styles</h2>
      </header>
      <div class="grid">
        <div class="list">
          <div
            *ngFor="let item of items" class="record"
              (click)="updateItem(item)"
              [class]="makeClass(item.index)"
              [class.one]="item.count === 0 | animate:'1000ms ease-out'"
              [class.two]="item.count === 1 | animate:'2000ms ease-out'"
              [class.three]="item.count === 2 | animate:'1000ms ease-out'"
              [class.four]="item.count === 3 | animate:'1000ms ease-out'"
              [class.on]="item.count === 1 | animate:'500ms ease-in'"
              [class.border]="item.count === 2 | animate:'1000ms ease-out'"
              [style.color]="item.count === 1 ? 'yellow' : null"
              [style]="styles | animate:'500ms ease-out'">
            <i class="material-icons">{{ item.title }}</i>
          </div>
        </div>
        <nav>
          <button (click)="animateWithStyles()">Update Styles</button>
          <button (click)="animateEverything()">Update Everything</button>
          <button (click)="animateWithCustomPlayer()">Custom Player</button>
        </nav>
      </div>
    </section>

    <section>
      <header>
        <h2>Automatic Measurement of Styles</h2>
      </header>
      <div class="grid">
        <div>
          <div class="box">
            <div class="header"
              (click)="toggleBox()"
              [class.active]="isOpen | animate:'300ms ease-out'">About Angular</div>
            <div class="content"
              [class.dark]="bg | animate:10000"
              [style.height]="
              (isOpen ? null : '0px') | animate:determineBoxEasing">
              <div class="inner">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vitae sem accumsan, finibus libero a, feugiat dui. Ut vel vestibulum lorem. Morbi vel venenatis eros, ac rhoncus dolor. Maecenas efficitur, elit at lobortis aliquam, elit sapien commodo ipsum, sed pulvinar sapien dui eu arcu. Mauris id magna sit amet leo luctus venenatis eu ut lectus. Sed quis elit a diam sagittis volutpat nec a ex. Mauris ac mi sit amet neque vehicula elementum ut vel nunc.
                </p>
                <p>
                  Quisque tempor nec nibh quis pellentesque. Proin fringilla pharetra lacus ut feugiat. Nullam cursus eros est. Nunc quis odio congue, lacinia mi ac, condimentum nisl. Ut sit amet felis condimentum, faucibus nibh in, pharetra quam. Vestibulum nec ipsum consectetur, accumsan ligula sed, finibus odio. Nulla et ex interdum, eleifend tortor in, dignissim nibh. Maecenas eu quam id quam ullamcorper efficitur vitae et neque. In ullamcorper neque et ante blandit molestie vitae quis elit. Vivamus id rutrum orci, in sollicitudin arcu. Praesent tempus dui vitae auctor facilisis.
                </p>
              </div>
            </div>
          </div>
        </div>
        <nav>
          <button (click)="toggleSpeed()">{{ boxSpeedLabel }}</button>
          <button (click)="toggleBox()">Toggle</button>
          <button (click)="toggleBg()">Toggle Background</button>
        </nav>
      </div>
    </section>
  `,
})
class AnimationWorldComponent {
  items: any[] = [
    {index: 1, title: 'group_work', count: 0},
    {index: 2, title: 'language', count: 0},
    {index: 3, title: 'payment', count: 0},
    {index: 4, title: 'find_replace', count: 0},
    {index: 5, title: 'rowing', count: 0},
    {index: 6, title: 'aspect_ratio', count: 0},
    {index: 7, title: 'assignment', count: 0},
    {index: 8, title: 'warning', count: 0},
    {index: 9, title: 'note', count: 0},
    {index: 10, title: 'volume_up', count: 0},
    {index: 11, title: 'vpn_key', count: 0},
    {index: 12, title: 'location_on', count: 0},
    {index: 13, title: 'mail', count: 0},
    {index: 14, title: 'cloud', count: 0},
    {index: 15, title: 'notes', count: 0},
    {index: 16, title: 'face', count: 0},
  ];
  private _hostElement: HTMLElement;
  public styles: {[key: string]: any}|null = {};
  public font = '';
  private _stylesActive = false;

  constructor(element: ElementRef) { this._hostElement = element.nativeElement; }

  get determineBoxEasing() { return this.boxSpeed + 'ms ease-out'; }

  updateItem(item: any) {
    const MAX_COUNT = 4;
    item.count = ++item.count % MAX_COUNT;
    markDirty(this);
  }

  public isOpen = false;
  public bg = false;
  toggleBg() {
    this.bg = !this.bg;
    markDirty(this);
  }

  public boxSpeed = 500;
  public boxSpeedLabel = 'Fast';

  toggleSpeed() {
    if (this.boxSpeed == 500) {
      this.boxSpeedLabel = 'Slow';
      this.boxSpeed = 1000;
    } else {
      this.boxSpeedLabel = 'Fast';
      this.boxSpeed = 500;
    }
    markDirty(this);
  }

  toggleBox() {
    this.isOpen = !this.isOpen;
    markDirty(this);
  }

  makeClass(index: string) { return `record-${index}`; }

  animateEverything() {
    for (let i = 0; i < 7; i++) {
      const index = Math.floor(Math.random() * this.items.length);
      const item = this.items[index];
      item.count = Math.floor(Math.random() * 4);
    }
    markDirty(this);
  }

  animateWithStyles() {
    if (this._stylesActive) {
      this.styles = {};
      this.font = '';
      this._stylesActive = false;
    } else {
      this.styles = {transform: 'rotate(20deg)'};
      this.font = '100px';
      this._stylesActive = true;
    }
    markDirty(this);
  }

  animateWithCustomPlayer() {
    const elements = this._hostElement.querySelectorAll('div.record') as any as HTMLElement[];
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const delay = i * 100;
      const player = buildAnimationPlayer(element, 'fadeInOut', `500ms ease-out ${delay}ms both`);
      addPlayer(element, player);
    }
  }
}

@Pipe({name: 'animate', pure: true})
class AnimatePipeForDemo extends AnimatePipe {
  transform(value: string|boolean|null|undefined|{[key: string]: any}, timingExp: string|number) {
    return super.transform(value, timingExp);
  }
}

@NgModule({declarations: [AnimationWorldComponent, AnimatePipeForDemo], imports: [CommonModule]})
class AnimationWorldModule {
}


function buildAnimationPlayer(element: HTMLElement, animationName: string, time: string): Player {
  return new SimpleKeyframePlayer(element, animationName, time);
}

class SimpleKeyframePlayer implements Player {
  state = PlayState.Pending;
  parent: Player|null = null;
  private _animationStyle: string = '';
  private _listeners: {[stateName: string]: (() => any)[]} = {};
  private _status = new Subject<PlayState|string>();

  getStatus() { return this._status; }

  constructor(private _element: HTMLElement, private _animationName: string, time: string) {
    this._animationStyle = `${time} ${_animationName}`;
  }

  private _start() {
    (this._element as any).style.animation = this._animationStyle;
    const animationFn = (event: AnimationEvent) => {
      if (event.animationName == this._animationName) {
        this._element.removeEventListener('animationend', animationFn);
        this.finish();
      }
    };
    this._element.addEventListener('animationend', animationFn);
  }
  addEventListener(state: PlayState|string, cb: () => any): void {
    const key = state.toString();
    const arr = this._listeners[key] = (this._listeners[key] || []);
    arr.push(cb);
  }
  play(): void {
    if (this.state <= PlayState.Pending) {
      this._start();
    }
    if (this.state != PlayState.Running) {
      setAnimationPlayState(this._element, 'running');
      this.state = PlayState.Running;
      this._emit(this.state);
    }
  }
  pause(): void {
    if (this.state != PlayState.Paused) {
      setAnimationPlayState(this._element, 'paused');
      this.state = PlayState.Paused;
      this._emit(this.state);
    }
  }
  finish(): void {
    if (this.state < PlayState.Finished) {
      this._element.style.animation = '';
      this.state = PlayState.Finished;
      this._emit(this.state);
    }
  }
  destroy(): void {
    if (this.state < PlayState.Destroyed) {
      this.finish();
      this.state = PlayState.Destroyed;
      this._emit(this.state);
    }
  }
  capture(): any {}
  private _emit(state: PlayState) {
    const arr = this._listeners[state.toString()] || [];
    arr.forEach(cb => cb());
  }
}

function setAnimationPlayState(element: HTMLElement, state: string) {
  element.style.animationPlayState = state;
}

class MyPlayerHandler implements PlayerHandler {
  private _players: Player[] = [];

  flushPlayers() {
    this._players.forEach(player => {
      if (!player.parent && player.state === PlayState.Pending) {
        player.play();
      }
    });
    this._players.length = 0;
  }

  queuePlayer(player: Player): void { this._players.push(player); }
}

const playerHandler = new MyPlayerHandler();
renderComponent(AnimationWorldComponent, {playerHandler});
ɵpublishDefaultGlobalUtils();
