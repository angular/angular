/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {WebAnimationsPlayer} from '../../../src/render/web_animations/web_animations_player';

describe('WebAnimationsPlayer tests', () => {
  let element: any;
  let innerPlayer: MockDomAnimation | null = null;
  beforeEach(() => {
    element = {};
    element['animate'] = () => {
      return (innerPlayer = new MockDomAnimation());
    };
  });

  it('should automatically pause the player when created and initialized', () => {
    const keyframes = [
      new Map<string, string | number>([
        ['opacity', 0],
        ['offset', 0],
      ]),
      new Map<string, string | number>([
        ['opacity', 1],
        ['offset', 1],
      ]),
    ];

    const player = new WebAnimationsPlayer(element, keyframes, {duration: 1000});

    player.init();
    const p = innerPlayer!;
    expect(p.log).toEqual(['pause']);

    player.play();
    expect(p.log).toEqual(['pause', 'play']);
  });

  it('should not pause the player if created and started before initialized', () => {
    const keyframes = [
      new Map<string, string | number>([
        ['opacity', 0],
        ['offset', 0],
      ]),
      new Map<string, string | number>([
        ['opacity', 1],
        ['offset', 1],
      ]),
    ];

    const player = new WebAnimationsPlayer(element, keyframes, {duration: 1000});

    player.play();
    const p = innerPlayer!;
    expect(p.log).toEqual(['play']);
  });

  it('should fire start/done callbacks manually when called directly', () => {
    const log: string[] = [];

    const player = new WebAnimationsPlayer(element, [], {duration: 1000});
    player.onStart(() => log.push('started'));
    player.onDone(() => log.push('done'));

    (player as any).triggerCallback('start');
    expect(log).toEqual(['started']);

    player.play();
    expect(log).toEqual(['started']);

    (player as any).triggerCallback('done');
    expect(log).toEqual(['started', 'done']);

    player.finish();
    expect(log).toEqual(['started', 'done']);
  });

  it('should allow setting position before animation is started', () => {
    const player = new WebAnimationsPlayer(element, [], {duration: 1000});

    player.setPosition(0.5);
    const p = innerPlayer!;
    expect(p.log).toEqual(['pause']);
    expect(p.currentTime).toEqual(500);
  });

  it('should continue playing animations from setPosition', () => {
    const player = new WebAnimationsPlayer(element, [], {duration: 1000});

    player.play();
    const p = innerPlayer!;
    expect(p.log).toEqual(['play']);

    player.setPosition(0.5);
    expect(p.currentTime).toEqual(500);
    expect(p.log).toEqual(['play']);
  });
});

class MockDomAnimation implements Animation {
  log: string[] = [];
  cancel(): void {
    this.log.push('cancel');
  }
  play(): void {
    this.log.push('play');
  }
  pause(): void {
    this.log.push('pause');
  }
  finish(): void {
    this.log.push('finish');
  }
  currentTime: number = 0;

  // Other properties to ensure conformance to interface
  effect: AnimationEffect | null = null;
  finished: Promise<Animation> = Promise.resolve({} as any);
  id: string = '';
  oncancel: ((this: Animation, ev: AnimationPlaybackEvent) => any) | null = null;
  onfinish: ((this: Animation, ev: AnimationPlaybackEvent) => any) | null = null;
  onremove: ((this: Animation, ev: Event) => any) | null = null;
  pending: boolean = false;
  playState: AnimationPlayState = 'running';
  playbackRate: number = 0;
  ready: Promise<Animation> = Promise.resolve({} as any);
  replaceState: AnimationReplaceState = 'active';
  startTime: number | null = null;
  timeline: AnimationTimeline | null = null;
  commitStyles(): void {
    throw new Error('Method not implemented.');
  }
  persist(): void {
    throw new Error('Method not implemented.');
  }
  reverse(): void {
    throw new Error('Method not implemented.');
  }
  updatePlaybackRate(playbackRate: number): void {
    throw new Error('Method not implemented.');
  }
  removeEventListener<K extends keyof AnimationEventMap>(
    type: K,
    listener: (this: Animation, ev: AnimationEventMap[K]) => any,
    options?: boolean | EventListenerOptions | undefined,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions | undefined,
  ): void;
  removeEventListener(type: unknown, listener: unknown, options?: unknown): void {
    throw new Error('Method not implemented.');
  }
  dispatchEvent(event: Event): boolean;
  dispatchEvent(event: Event): boolean;
  dispatchEvent(event: unknown): boolean {
    throw new Error('Method not implemented.');
  }
  removeAllListeners?(eventName?: string | undefined): void {
    throw new Error('Method not implemented.');
  }
  eventListeners?(eventName?: string | undefined): EventListenerOrEventListenerObject[] {
    throw new Error('Method not implemented.');
  }
  addEventListener(eventName: string, handler: (event: any) => any): any {}
}
