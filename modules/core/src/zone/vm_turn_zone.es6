import {List, ListWrapper} from 'facade/collection';
import {normalizeBlank} from 'facade/lang';

export class VmTurnZone {
  _outerZone;
  _innerZone;

  _onTurnStart:Function;
  _onTurnDone:Function;

  _nestedRunCounter:number;

  constructor() {
    this._nestedRunCounter = 0;
    this._onTurnStart = null;
    this._onTurnDone = null;

    this._outerZone = window.zone;
    this._innerZone = this._outerZone.fork({
      beforeTask: () => this._beforeTask(),
      afterTask: () => this._afterTask()
    });
  }

  initCallbacks({onTurnStart, onTurnDone, onScheduleMicrotask} = {}) {
    this._onTurnStart = normalizeBlank(onTurnStart);
    this._onTurnDone = normalizeBlank(onTurnDone);
  }

  run(fn) {
    return this._innerZone.run(fn);
  }

  runOutsideAngular(fn) {
    return this._outerZone.run(fn);
  }


  _beforeTask(){
    this._nestedRunCounter ++;
    if(this._nestedRunCounter === 1 && this._onTurnStart) {
      this._onTurnStart();
    }
  }

  _afterTask(){
    this._nestedRunCounter --;
    if(this._nestedRunCounter === 0 && this._onTurnDone) {
      this._onTurnDone();
    }
  }
}