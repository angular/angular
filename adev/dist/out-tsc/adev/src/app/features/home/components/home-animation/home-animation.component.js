/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import {RouterLink} from '@angular/router';
import {WINDOW, isIos, shouldReduceMotion} from '@angular/docs';
import {AnimationCreatorService, AnimationLayerDirective} from '../../animation';
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
let HomeAnimationComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'adev-home-animation',
      imports: [AnimationLayerDirective, RouterLink],
      templateUrl: './home-animation.component.html',
      styleUrl: './home-animation.component.scss',
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HomeAnimationComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      HomeAnimationComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    win = inject(WINDOW);
    animCreator = inject(AnimationCreatorService);
    injector = inject(Injector);
    elementRef = inject(ElementRef);
    destroyRef = inject(DestroyRef);
    animationLayers = viewChildren(AnimationLayerDirective);
    ctaLink = isIos ? 'overview' : 'tutorials/learn-angular';
    isUwu = input.required();
    ready = output();
    reducedMotion = signal(shouldReduceMotion());
    meteorFieldData = signal(null);
    meteors = signal([]);
    constructor() {
      if (!this.reducedMotion()) {
        this.initAnimation();
      } else {
        this.ready.emit(true);
      }
    }
    initAnimation() {
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
    calculateMeteorDimensions() {
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
    calculateMeteorFieldData(meteorDim) {
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
    setCssVariables({width, height, tailLength, tiltAngle, gap}) {
      const styleRef = this.elementRef.nativeElement.style;
      styleRef.setProperty('--meteor-width', width + 'px');
      styleRef.setProperty('--meteor-height', height + 'px');
      styleRef.setProperty('--meteor-tail-length', tailLength + 'px');
      styleRef.setProperty('--meteor-tilt-angle', tiltAngle + 'rad');
      styleRef.setProperty('--meteor-gap', gap + 'px');
    }
  };
  return (HomeAnimationComponent = _classThis);
})();
export {HomeAnimationComponent};
//# sourceMappingURL=home-animation.component.js.map
