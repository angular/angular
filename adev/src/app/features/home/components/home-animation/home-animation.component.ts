/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  input,
  OnDestroy,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import {RouterLink} from '@angular/router';
import {WINDOW, isIos, shouldReduceMotion} from '@angular/docs';

import {Animation, AnimationCreatorService, AnimationLayerDirective} from '../../animation';
import {AnimationScrollHandler} from '../../animation/plugins/animation-scroll-handler';
import {generateHomeAnimationDefinition, ANIM_TIMESTEP} from './animation-definition';

export const METEOR_HW_RATIO = 1.42; // Height to width ratio
export const METEOR_GAP_RATIO = 1.33; // Use 0.7 for WebGL-like field. Renders a lot of elements though.

// A map with screen size to meteor width
export const METEOR_WIDTH_MAP = [
  [800, 60],
  [1100, 90],
];

export const METEOR_WIDTH_DEFAULT = 120; // For screens larger than 1100px

type MeteorDimensions = {
  width: number;
  height: number;
  tailLength: number;
  gap: number;
  tiltAngle: number; // In radians
};

type MeteorFieldData = {
  width: number;
  height: number;
  count: number;
  marginLeft: number;
  marginTop: number;
};

@Component({
  selector: 'adev-home-animation',
  imports: [AnimationLayerDirective, RouterLink],
  templateUrl: './home-animation.component.html',
  styleUrl: './home-animation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeAnimationComponent {
  private readonly win = inject(WINDOW);
  private readonly animCreator = inject(AnimationCreatorService);
  private readonly injector = inject(Injector);
  private readonly elementRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly animationLayers = viewChildren(AnimationLayerDirective);

  readonly ctaLink = isIos ? 'overview' : 'tutorials/learn-angular';

  readonly isUwu = input.required<boolean>();
  readonly ready = output<boolean>();

  readonly reducedMotion = signal<boolean>(shouldReduceMotion());
  readonly meteorFieldData = signal<MeteorFieldData | null>(null);
  readonly meteors = signal<number[]>([]);

  constructor() {
    if (!this.reducedMotion()) {
      this.initAnimation();
    } else {
      this.ready.emit(true);
    }
  }

  private initAnimation() {
    // Limitation: Meteor dimensions won't change on page resize
    const meteorDimensions = this.calculateMeteorDimensions();
    const data = this.calculateMeteorFieldData(meteorDimensions);
    this.setCssVariables(meteorDimensions);
    this.meteorFieldData.set(data);

    // Generate a meteor field. The number represents the type [1, 3]
    this.meteors.set(new Array(data.count).fill(1).map(() => Math.round(Math.random() * 2 + 1)));

    afterNextRender({
      read: () => {
        const animation = this.animCreator
          .createAnimation(this.animationLayers(), {timestep: ANIM_TIMESTEP})
          .define(generateHomeAnimationDefinition(this.isUwu(), this.meteors().length))
          .addPlugin(new AnimationScrollHandler(this.elementRef, this.injector));

        this.ready.emit(true);
        this.destroyRef.onDestroy(() => animation.dispose());
      },
    });
  }

  /** Calculte the dimensions and sizes of a meteor – width, height, tail, tilt angle, etc. */
  private calculateMeteorDimensions(): MeteorDimensions {
    let width = METEOR_WIDTH_DEFAULT;

    for (const [screenSize, meteorWidth] of METEOR_WIDTH_MAP) {
      if (this.win.innerWidth <= screenSize) {
        width = meteorWidth;
      }
    }

    const height = width * METEOR_HW_RATIO;
    const gap = width * METEOR_GAP_RATIO;

    // Pythagorean theorem + some trigonometry
    const tailLength = Math.sqrt(width * width + height * height);
    const tiltAngle = -Math.asin(width / tailLength);

    return {
      width,
      height,
      gap,
      tailLength,
      tiltAngle,
    };
  }

  /** Calculate the number of meteors and size of the field. */
  private calculateMeteorFieldData(meteorDim: MeteorDimensions): MeteorFieldData {
    const mW = meteorDim.width + meteorDim.gap;
    const mH = meteorDim.height + meteorDim.gap;
    let rows = 1;
    let cols = 1;

    while (cols * mW - meteorDim.gap <= this.win.innerWidth) {
      cols++;
    }
    while (rows * mH - meteorDim.gap <= this.win.innerHeight) {
      rows++;
    }

    const width = cols * mW - meteorDim.gap;
    const height = rows * mH - meteorDim.gap;

    return {
      count: rows * cols,
      width,
      height,
      marginLeft: -(width - this.win.innerWidth) / 2,
      marginTop: -(height - this.win.innerHeight) / 2,
    };
  }

  private setCssVariables({width, height, tailLength, tiltAngle, gap}: MeteorDimensions) {
    const styleRef = this.elementRef.nativeElement.style;
    styleRef.setProperty('--meteor-width', width + 'px');
    styleRef.setProperty('--meteor-height', height + 'px');
    styleRef.setProperty('--meteor-tail-length', tailLength + 'px');
    styleRef.setProperty('--meteor-tilt-angle', tiltAngle + 'rad');
    styleRef.setProperty('--meteor-gap', gap + 'px');
  }
}
