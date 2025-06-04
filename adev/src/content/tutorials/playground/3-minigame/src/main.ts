import {A11yModule} from '@angular/cdk/a11y';
import {CommonModule} from '@angular/common';
import {Component, ElementRef, ViewChild, computed, signal} from '@angular/core';
import {MatSlideToggleChange, MatSlideToggleModule} from '@angular/material/slide-toggle';
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

function getChangingQuote(rotateValue: number): string {
  let possibleQuotes = CHANGING_QUOTES[1];
  if (rotateValue < 110) {
    possibleQuotes = CHANGING_QUOTES[0];
  } else if (rotateValue >= 230) {
    possibleQuotes = CHANGING_QUOTES[2];
  }
  const randomQuoteIndex = Math.floor(Math.random() * possibleQuotes.length);
  return possibleQuotes[randomQuoteIndex];
}

function getResultQuote(accuracy: number) {
  let possibleQuotes = RESULT_QUOTES[1];
  if (accuracy < 50) {
    possibleQuotes = RESULT_QUOTES[0];
  } else if (accuracy >= 85) {
    possibleQuotes = RESULT_QUOTES[2];
  }
  let randomQuoteIndex = Math.floor(Math.random() * possibleQuotes.length);
  return possibleQuotes[randomQuoteIndex];
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, MatSlideToggleModule, A11yModule],
  styleUrl: 'game.css',
  templateUrl: 'game.html',
})
export class Playground {
  protected readonly isGuessModalOpen = signal(false);
  protected readonly isAccessiblePanelOpen = signal(false);
  protected readonly rotateVal = signal(40);
  protected readonly goal = signal(85);
  protected readonly animatedAccuracy = signal(0);
  protected readonly gameStats = signal({
    level: 0,
    totalAccuracy: 0,
  });
  protected readonly resultQuote = signal('');

  private isDragging = false;
  private currentInteractions: {lastChangedAt: number; face: number; quote: string} = {
    lastChangedAt: 75,
    face: 0,
    quote: "Hi, I'm NG the Angle!",
  };

  @ViewChild('staticArrow') staticArrow!: ElementRef;

  protected readonly totalAccuracyPercentage = computed(() => {
    const {level, totalAccuracy} = this.gameStats();
    if (level === 0) {
      return 0;
    }
    return totalAccuracy / level;
  });

  protected readonly updatedInteractions = computed(() => {
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

  mouseMove(e: MouseEvent) {
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

  adjustAngle(degreeChange: number) {
    this.rotateVal.update((x) =>
      x + degreeChange < 0 ? 360 + (x + degreeChange) : (x + degreeChange) % 360,
    );
  }

  touchMove(e: Event) {
    let firstTouch = (e as TouchEvent).touches[0];
    if (firstTouch) {
      this.mouseMove({pageX: firstTouch.pageX, pageY: firstTouch.pageY} as MouseEvent);
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

  powerUpAccuracy(finalAcc: number) {
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
      `📐 ${emojiAccuracy} \n My angles are ${roundedAcc}% accurate on level ${
        this.gameStats().level
      }. \n\nHow @Angular are you? \nhttps://angular.dev/playground`,
    );
  }

  toggleA11yControls(event: MatSlideToggleChange) {
    this.isAccessiblePanelOpen.set(event.checked);
  }
}

bootstrapApplication(Playground);
