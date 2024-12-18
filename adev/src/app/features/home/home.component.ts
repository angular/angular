/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {HomeAnimationComponent} from './components/home-animation/home-animation.component';
import {CodeEditorComponent} from './components/home-editor.component';

export const TUTORIALS_HOMEPAGE_DIRECTORY = 'homepage';

@Component({
  selector: 'adev-home',
  imports: [HomeAnimationComponent, CodeEditorComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Home {
  private readonly activatedRoute = inject(ActivatedRoute);

  protected readonly tutorialFiles = TUTORIALS_HOMEPAGE_DIRECTORY;
  protected readonly isUwu = 'uwu' in this.activatedRoute.snapshot.queryParams;
  animationReady = signal<boolean>(false);

  onAnimationReady(ready: boolean) {
    this.animationReady.set(ready);
  }
}
