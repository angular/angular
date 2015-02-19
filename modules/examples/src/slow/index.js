import {Component, Template, bootstrap, Foreach} from 'angular2/angular2';
// import {bind} from 'angular2/di';
// TODO(juliemr): Is this legit? Should we be using XHR directly?
import {XHR} from 'angular2/src/core/compiler/xhr/xhr';


const _STATUS = {
  NOT_STARTED: 'not started',
  PENDING: 'pending',
  DONE: 'done'
}

const _DELAY = 5000;
const _SUPER_DELAY = 60 * 60 * 1000; // 1 hour

@Component({
  selector: 'slow-app',
  componentServices: []
})
@Template({
  url: 'slow.html'
})
class SlowApp {
  _xhr: XHR;
  timeoutStatus: string;
  intervalStatus: string;
  intervalCount: number;
  httpStatus: string;

  constructor(xhr: XHR) {
    this._xhr = xhr;
    this.timeoutStatus = this.intervalStatus = this.httpStatus = _STATUS.NOT_STARTED;
    this.intervalCount = 0;
  }

  doTimeout() {
    this.timeoutStatus = _STATUS.PENDING;
    setTimeout(() => this.timeoutStatus = _STATUS.DONE, _DELAY);
  }

  startInterval() {
    this.intervalStatus = _STATUS.PENDING;
    setInterval(() => this.intervalCount++, _DELAY);
  }

  doHttp() {
    this.httpStatus = _STATUS.PENDING;
    // TODO(juliemr): have an actual server attached to this serving.
    // gulp serve.js.dev is using 'gulp connect' plugin. Figure out if we can
    // add something there - if not, this should get moved to another
    // serving system.
    var promise = this._xhr.get('/slowcall');
    promise.then((response) => this.httpStatus = _STATUS.DONE);
  }
}

@Component({
  selector: 'secondary-app'
})
@Template({
  inline: `<h4>A separate Angular2 app</h4>
           <button (click)="startLongTimeout()">Super slow timeout</button>
           <span>{{timeoutStatus}}</span>`
})
class SecondaryApp {
  timeoutStatus: string;
  constructor() {
    this.timeoutStatus = _STATUS.NOT_STARTED;
  }

  startLongTimeout() {
    this.timeoutStatus = _STATUS.PENDING;
    setTimeout(() => this.timeoutStatus = _STATUS.DONE, _SUPER_DELAY);
  }
}

@Component({
  selector: 'bound-app'
})
@Template({
  inline: `<div>
             <span>{{foo}}</span>
             <span [title]="bar">With Title</span>
             <div>
               <span>{{yyy}} and {{zzz}}</span>
             </div>
             <nested-component></nested-component>
           </div>`,
  directives: [NestedComponent]
})
class BoundApp {
  foo;
  bar;
  yyy;
  zzz;

  constructor() {
    this.foo = 'Foo';
    this.bar = 'Bar';
    this.yyy = 'YYY';
    this.zzz = 'ZZZ';
  }
}

@Component({
  selector: 'nested-component',
})
@Template({
  inline: `<div>
             <span>{{qux}}</span>
           </div>`
})
class NestedComponent {
  qux;

  constructor() {
    this.qux = 'Qux';
  }
}

export function main() {
  bootstrap(SlowApp);
  bootstrap(SecondaryApp);
  bootstrap(BoundApp);
}
