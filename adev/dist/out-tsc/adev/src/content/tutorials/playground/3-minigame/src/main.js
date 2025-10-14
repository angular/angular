import {__esDecorate, __runInitializers} from 'tslib';
import {A11yModule} from '@angular/cdk/a11y';
import {CommonModule} from '@angular/common';
import {Component, ViewChild, computed, signal} from '@angular/core';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {bootstrapApplication} from '@angular/platform-browser';
const RESULT_QUOTES = [
  [
    'Not quite right!',
    'You missed the mark!',
    'Have you seen an angle before?',
    'Your measurements are all over the place!',
    'Your precision needs work!',
  ],
  ['Not too shabby.', 'Getting sharper, keep it up!', 'Not perfect, but getting better!'],
  [
    'Your angles are on point!',
    'Your precision is unparalleled!',
    'Your geometric skills are divine!',
    "Amazing! You're acute-y!",
    'Wow! So precise!',
  ],
];
const CHANGING_QUOTES = [
  ["I'm such a-cute-y!", "I'm a tiny slice of pi!", "You're doing great!"],
  ["I'm wide open!", 'Keep going!', 'Wow!', 'Wheee!!'],
  ["I'm so obtuse!", 'The bigger the better!', "Life's too short for right angles!", 'Whoa!'],
];
function getChangingQuote(rotateValue) {
  let possibleQuotes = CHANGING_QUOTES[1];
  if (rotateValue < 110) {
    possibleQuotes = CHANGING_QUOTES[0];
  } else if (rotateValue >= 230) {
    possibleQuotes = CHANGING_QUOTES[2];
  }
  const randomQuoteIndex = Math.floor(Math.random() * possibleQuotes.length);
  return possibleQuotes[randomQuoteIndex];
}
function getResultQuote(accuracy) {
  let possibleQuotes = RESULT_QUOTES[1];
  if (accuracy < 50) {
    possibleQuotes = RESULT_QUOTES[0];
  } else if (accuracy >= 85) {
    possibleQuotes = RESULT_QUOTES[2];
  }
  let randomQuoteIndex = Math.floor(Math.random() * possibleQuotes.length);
  return possibleQuotes[randomQuoteIndex];
}
let Playground = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-root',
      imports: [CommonModule, MatSlideToggleModule, A11yModule],
      styleUrl: 'game.css',
      templateUrl: 'game.html',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _staticArrow_decorators;
  let _staticArrow_initializers = [];
  let _staticArrow_extraInitializers = [];
  var Playground = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      _staticArrow_decorators = [ViewChild('staticArrow')];
      __esDecorate(
        null,
        null,
        _staticArrow_decorators,
        {
          kind: 'field',
          name: 'staticArrow',
          static: false,
          private: false,
          access: {
            has: (obj) => 'staticArrow' in obj,
            get: (obj) => obj.staticArrow,
            set: (obj, value) => {
              obj.staticArrow = value;
            },
          },
          metadata: _metadata,
        },
        _staticArrow_initializers,
        _staticArrow_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      Playground = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    isGuessModalOpen = signal(false);
    isAccessiblePanelOpen = signal(false);
    rotateVal = signal(40);
    goal = signal(85);
    animatedAccuracy = signal(0);
    gameStats = signal({
      level: 0,
      totalAccuracy: 0,
    });
    resultQuote = signal('');
    isDragging = false;
    currentInteractions = {
      lastChangedAt: 75,
      face: 0,
      quote: "Hi, I'm NG the Angle!",
    };
    staticArrow = __runInitializers(this, _staticArrow_initializers, void 0);
    totalAccuracyPercentage =
      (__runInitializers(this, _staticArrow_extraInitializers),
      computed(() => {
        const {level, totalAccuracy} = this.gameStats();
        if (level === 0) {
          return 0;
        }
        return totalAccuracy / level;
      }));
    updatedInteractions = computed(() => {
      if (
        this.rotateVal() > 75 &&
        Math.abs(this.rotateVal() - this.currentInteractions.lastChangedAt) > 70 &&
        Math.random() > 0.5
      ) {
        this.currentInteractions = {
          lastChangedAt: this.rotateVal(),
          face: Math.floor(Math.random() * 6),
          quote: getChangingQuote(this.rotateVal()),
        };
      }
      return this.currentInteractions;
    });
    constructor() {
      this.resetGame();
    }
    resetGame() {
      this.goal.set(Math.floor(Math.random() * 360));
      this.rotateVal.set(40);
    }
    getRotation() {
      return `rotate(${this.rotateVal()}deg)`;
    }
    getIndicatorStyle() {
      return 0.487 * this.rotateVal() - 179.5;
    }
    getIndicatorRotation() {
      return `rotate(${253 + this.rotateVal()}deg)`;
    }
    mouseDown() {
      this.isDragging = true;
    }
    stopDragging() {
      this.isDragging = false;
    }
    mouseMove(e) {
      const vh30 = 0.3 * document.documentElement.clientHeight;
      if (!this.isDragging) return;
      let pointX = e.pageX - (this.staticArrow.nativeElement.offsetLeft + 2.5);
      let pointY = e.pageY - (this.staticArrow.nativeElement.offsetTop + vh30);
      let calculatedAngle = 0;
      if (pointX >= 0 && pointY < 0) {
        calculatedAngle = 90 - (Math.atan2(Math.abs(pointY), pointX) * 180) / Math.PI;
      } else if (pointX >= 0 && pointY >= 0) {
        calculatedAngle = 90 + (Math.atan2(pointY, pointX) * 180) / Math.PI;
      } else if (pointX < 0 && pointY >= 0) {
        calculatedAngle = 270 - (Math.atan2(pointY, Math.abs(pointX)) * 180) / Math.PI;
      } else {
        calculatedAngle = 270 + (Math.atan2(Math.abs(pointY), Math.abs(pointX)) * 180) / Math.PI;
      }
      this.rotateVal.set(calculatedAngle);
    }
    adjustAngle(degreeChange) {
      this.rotateVal.update((x) =>
        x + degreeChange < 0 ? 360 + (x + degreeChange) : (x + degreeChange) % 360,
      );
    }
    touchMove(e) {
      let firstTouch = e.touches[0];
      if (firstTouch) {
        this.mouseMove({pageX: firstTouch.pageX, pageY: firstTouch.pageY});
      }
    }
    guess() {
      this.isGuessModalOpen.set(true);
      const calcAcc = Math.abs(100 - (Math.abs(this.goal() - this.rotateVal()) / 180) * 100);
      this.resultQuote.set(getResultQuote(calcAcc));
      this.animatedAccuracy.set(calcAcc > 20 ? calcAcc - 20 : 0);
      this.powerUpAccuracy(calcAcc);
      this.gameStats.update(({level, totalAccuracy}) => ({
        level: level + 1,
        totalAccuracy: totalAccuracy + calcAcc,
      }));
    }
    powerUpAccuracy(finalAcc) {
      if (this.animatedAccuracy() >= finalAcc) return;
      let difference = finalAcc - this.animatedAccuracy();
      if (difference > 20) {
        this.animatedAccuracy.update((x) => x + 10.52);
        setTimeout(() => this.powerUpAccuracy(finalAcc), 30);
      } else if (difference > 4) {
        this.animatedAccuracy.update((x) => x + 3.31);
        setTimeout(() => this.powerUpAccuracy(finalAcc), 40);
      } else if (difference > 0.5) {
        this.animatedAccuracy.update((x) => x + 0.49);
        setTimeout(() => this.powerUpAccuracy(finalAcc), 50);
      } else if (difference >= 0.1) {
        this.animatedAccuracy.update((x) => x + 0.1);
        setTimeout(() => this.powerUpAccuracy(finalAcc), 100);
      } else {
        this.animatedAccuracy.update((x) => x + 0.01);
        setTimeout(() => this.powerUpAccuracy(finalAcc), 100);
      }
    }
    close() {
      this.isGuessModalOpen.set(false);
      this.resetGame();
    }
    getText() {
      const roundedAcc = Math.floor(this.totalAccuracyPercentage() * 10) / 10;
      let emojiAccuracy = '';
      for (let i = 0; i < 5; i++) {
        emojiAccuracy += roundedAcc >= 20 * (i + 1) ? '🟩' : '⬜️';
      }
      return encodeURI(
        `📐 ${emojiAccuracy} \n My angles are ${roundedAcc}% accurate on level ${this.gameStats().level}. \n\nHow @Angular are you? \nhttps://angular.dev/playground`,
      );
    }
    toggleA11yControls(event) {
      this.isAccessiblePanelOpen.set(event.checked);
    }
  };
  return (Playground = _classThis);
})();
export {Playground};
bootstrapApplication(Playground);
//# sourceMappingURL=main.js.map
