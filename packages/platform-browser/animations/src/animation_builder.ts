/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationBuilder, AnimationFactory, AnimationMetadata, AnimationOptions, AnimationPlayer, sequence} from '@angular/animations';
import {DOCUMENT} from '@angular/common';
import {Inject, Injectable, RendererFactory2, RendererType2, ViewEncapsulation} from '@angular/core';

import {AnimationRenderer} from './animation_renderer';

@Injectable()
export class BrowserAnimationBuilder extends AnimationBuilder {
  private _nextAnimationId = 0;
  private _renderer: AnimationRenderer;

  constructor(rootRenderer: RendererFactory2, @Inject(DOCUMENT) doc: any) {
    super();
    const typeData =
        {id: '0', encapsulation: ViewEncapsulation.None, styles: [], data: {animation: []}} as
        RendererType2;
    this._renderer = rootRenderer.createRenderer(doc.body, typeData) as AnimationRenderer;
  }

  build(animation: AnimationMetadata|AnimationMetadata[]): AnimationFactory {
    const id = this._nextAnimationId.toString();
    this._nextAnimationId++;
    const entry = Array.isArray(animation) ? sequence(animation) : animation;
    issueAnimationCommand(this._renderer, null, id, 'register', [entry]);
    return new BrowserAnimationFactory(id, this._renderer);
  }
}

export class BrowserAnimationFactory extends AnimationFactory {
  constructor(private _id: string, private _renderer: AnimationRenderer) {
    super();
  }

  create(element: any, options?: AnimationOptions): AnimationPlayer {
    return new RendererAnimationPlayer(this._id, element, options || {}, this._renderer);
  }
}

export class RendererAnimationPlayer implements AnimationPlayer {
  public parentPlayer: AnimationPlayer|null = null;
  private _started = false;

  constructor(
      public id: string, public element: any, options: AnimationOptions,
      private _renderer: AnimationRenderer) {
    this._command('create', options);
  }

  private _listen(eventName: string, callback: (event: any) => any): () => void {
    return this._renderer.listen(this.element, `@@${this.id}:${eventName}`, callback);
  }

  private _command(command: string, ...args: any[]) {
    return issueAnimationCommand(this._renderer, this.element, this.id, command, args);
  }

  onDone(fn: () => void): void {
    this._listen('done', fn);
  }

  onStart(fn: () => void): void {
    this._listen('start', fn);
  }

  onDestroy(fn: () => void): void {
    this._listen('destroy', fn);
  }

  init(): void {
    this._command('init');
  }

  hasStarted(): boolean {
    return this._started;
  }

  play(): void {
    this._command('play');
    this._started = true;
  }

  pause(): void {
    this._command('pause');
  }

  restart(): void {
    this._command('restart');
  }

  finish(): void {
    this._command('finish');
  }

  destroy(): void {
    this._command('destroy');
  }

  reset(): void {
    this._command('reset');
  }

  setPosition(p: number): void {
    this._command('setPosition', p);
  }

  getPosition(): number {
    return this._renderer.engine.players[+this.id]?.getPosition() ?? 0;
  }

  public totalTime = 0;
}

function issueAnimationCommand(
    renderer: AnimationRenderer, element: any, id: string, command: string, args: any[]): any {
  return renderer.setProperty(element, `@@${id}:${command}`, args);
}
