import {HammerGesturesPluginCommon} from './hammer_common';
import {isPresent} from 'angular2/src/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';
import {Injectable} from 'angular2/src/core/di';

@Injectable()
export class HammerGesturesPlugin extends HammerGesturesPluginCommon {
  supports(eventName: string): boolean {
    if (!super.supports(eventName)) return false;

    if (!isPresent(window['Hammer'])) {
      throw new BaseException(`Hammer.js is not loaded, can not bind ${eventName} event`);
    }

    return true;
  }

  addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
    var zone = this.manager.getZone();
    eventName = eventName.toLowerCase();

    return zone.runOutsideAngular(function() {
      // Creating the manager bind events, must be done outside of angular
      var mc = new Hammer(element);
      mc.get('pinch').set({enable: true});
      mc.get('rotate').set({enable: true});
      var handler = function(eventObj) { zone.run(function() { handler(eventObj); }); };
      mc.on(eventName, handler);
      return () => { mc.off(eventName, handler); };
    });
  }
}
