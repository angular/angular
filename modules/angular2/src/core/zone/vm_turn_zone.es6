import {List, ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {normalizeBlank, isPresent, global} from 'angular2/src/facade/lang';

export class VmTurnZone {
  _outerZone;
  _innerZone;

  _onTurnStart:Function;
  _onTurnDone:Function;
  _onErrorHandler:Function;

  _nestedRunCounter:number;

  constructor({enableLongStackTrace}) {
    this._nestedRunCounter = 0;
    this._onTurnStart = null;
    this._onTurnDone = null;
    this._onErrorHandler = null;

    this._outerZone = global.zone;
    this._innerZone = this._createInnerZone(this._outerZone, enableLongStackTrace);
  }

  initCallbacks({onTurnStart, onTurnDone, onScheduleMicrotask, onErrorHandler} = {}) {
    this._onTurnStart = normalizeBlank(onTurnStart);
    this._onTurnDone = normalizeBlank(onTurnDone);
    this._onErrorHandler = normalizeBlank(onErrorHandler);
  }

  run(fn) {
    return this._innerZone.run(fn);
  }

  runOutsideAngular(fn) {
    return this._outerZone.run(fn);
  }

  _createInnerZone(zone, enableLongStackTrace) {
    var vmTurnZone = this;
    var errorHandling;

    if (enableLongStackTrace) {
      errorHandling = StringMapWrapper.merge(Zone.longStackTraceZone, {
        onError: function (e) {
          vmTurnZone._onError(this, e)
        }
      });
    } else {
      errorHandling = {
        onError: function (e) {
          vmTurnZone._onError(this, e)
        }
      };
    }

    return zone.fork(errorHandling).fork({
      beforeTask: () => {this._beforeTask()},
      afterTask: () => {this._afterTask()}
    });
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

  _onError(zone, e) {
    if (isPresent(this._onErrorHandler)) {
      var trace = [normalizeBlank(e.stack)];

      while (zone && zone.constructedAtException) {
        trace.push(zone.constructedAtException.get());
        zone = zone.parent;
      }
      this._onErrorHandler(e, trace);
    } else {
      throw e;
    }
  }
}