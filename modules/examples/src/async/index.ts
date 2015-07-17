import {NgIf, bootstrap, Component, View} from 'angular2/angular2';
import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';
import {TimerWrapper} from 'angular2/src/facade/async';


@Component({selector: 'async-app'})
@View({
  template: `
    <div id='increment'>
      <span class='val'>{{val1}}</span>
      <button class='action' (click)="increment()">Increment</button>
    </div>
    <div id='delayedIncrement'>
      <span class='val'>{{val2}}</span>
      <button class='action' (click)="delayedIncrement()">Delayed Increment</button>
      <button class='cancel' *ng-if="!!timeoutId" (click)="cancelDelayedIncrement()">Cancel</button>              
    </div>
    <div id='multiDelayedIncrements'>
      <span class='val'>{{val3}}</span>
      <button class='action' (click)="multiDelayedIncrements(10)">10 Delayed Increments</button>
      <button class='cancel' *ng-if="!!multiTimeoutId" (click)="cancelMultiDelayedIncrements()">Cancel</button>              
    </div>
    <div id='periodicIncrement'>
      <span class='val'>{{val4}}</span>
      <button class='action' (click)="periodicIncrement()">Periodic Increment</button>
      <button class='cancel' *ng-if="!!intervalId" (click)="cancelPeriodicIncrement()">Cancel</button>
    </div>
  `,
  directives: [NgIf]
})
class AsyncApplication {
  val1: number = 0;
  val2: number = 0;
  val3: number = 0;
  val4: number = 0;
  timeoutId; 
  multiTimeoutId; 
  intervalId;

  increment(): void { this.val1++; };

  delayedIncrement(): void { 
    this.cancelDelayedIncrement();
    this.timeoutId = TimerWrapper.setTimeout(() => { this.val2++; this.timeoutId = null; }, 2000);
  };

  multiDelayedIncrements(i: number): void { 
    this.cancelMultiDelayedIncrements();

    var self = this;
    (function helper(_i: number) {
      if (_i <= 0) {
        self.multiTimeoutId = null;
        return;
      }

      self.multiTimeoutId = TimerWrapper.setTimeout(() => { 
        self.val3++; 
        helper(_i - 1);
      }, 500);
    })(i);
  };

  periodicIncrement(): void {
    this.cancelPeriodicIncrement();
    this.intervalId = TimerWrapper.setInterval(() => { this.val4++; }, 2000) 
  };

  cancelDelayedIncrement(): void {
    if (!!this.timeoutId) {
      TimerWrapper.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  };

  cancelMultiDelayedIncrements(): void {
    if (!!this.multiTimeoutId) {
      TimerWrapper.clearTimeout(this.multiTimeoutId);
      this.multiTimeoutId = null;
    }
  };

  cancelPeriodicIncrement(): void {
    if (!!this.intervalId) {
      TimerWrapper.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  };
}

export function main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  bootstrap(AsyncApplication);
}
