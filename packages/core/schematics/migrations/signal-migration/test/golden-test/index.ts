// tslint:disable

import {Component, Input} from '@angular/core';

interface Vehicle {}
interface Car extends Vehicle {
  __car: true;
}
interface Audi extends Car {
  __audi: true;
}

@Component({
  selector: 'app-component',
  templateUrl: './template.html',
})
export class AppComponent {
  @Input() input: string | null = null;
  @Input({transform: disabledTransform, required: true}) bla: boolean = false;
  @Input() narrowableMultipleTimes: Vehicle | null = null;
  @Input() withUndefinedInput: string | undefined;
  @Input() incompatible: string | null = null;

  private _bla: any;
  @Input()
  set ngSwitch(newValue: any) {
    this._bla = newValue;
    if (newValue === 0) {
      console.log('test');
    }
  }

  someControlFlowCase() {
    if (this.input) {
      this.input.charAt(0);
    }
  }

  moreComplexControlFlowCase() {
    if (!this.input) {
      return;
    }

    this.doSomething();

    (() => {
      // might be a different input value now?!
      // No! it can't because we don't allow writes to "input"!!.
      console.log(this.input.substring(0));
    })();
  }

  doSomething() {
    this.incompatible = 'some other value';
  }

  vsd() {
    if (!this.input && this.narrowableMultipleTimes !== null) {
      return this.narrowableMultipleTimes;
    }
    return this.input ? 'eager' : 'lazy';
  }

  allTheSameNoNarrowing() {
    console.log(this.input);
    console.log(this.input);
  }

  test() {
    if (this.narrowableMultipleTimes) {
      console.log();

      const x = () => {
        // @ts-expect-error
        if (isCar(this.narrowableMultipleTimes)) {
        }
      };

      console.log();
      console.log();
      x();
      x();
    }
  }

  extremeNarrowingNested() {
    if (this.narrowableMultipleTimes && isCar(this.narrowableMultipleTimes)) {
      this.narrowableMultipleTimes.__car;

      let car = this.narrowableMultipleTimes;
      let ctx = this;

      function nestedFn() {
        if (isAudi(car)) {
          console.log(car.__audi);
        }
        if (!isCar(ctx.narrowableMultipleTimes!) || !isAudi(ctx.narrowableMultipleTimes)) {
          return;
        }

        ctx.narrowableMultipleTimes.__audi;
      }

      // iife
      (() => {
        if (isAudi(this.narrowableMultipleTimes)) {
          this.narrowableMultipleTimes.__audi;
        }
      })();
    }
  }
}

function disabledTransform(bla: string | boolean): boolean {
  return true;
}

function isCar(v: Vehicle): v is Car {
  return true;
}

function isAudi(v: Car): v is Audi {
  return true;
}

const x: AppComponent = null!;
x.incompatible = null;
