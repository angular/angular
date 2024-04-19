import 'zone.js/bundles/zone.umd';

import * as domino from 'domino';

// Zone public API should be included
Zone.current.fork({name: 'testZone'}).run(() => {});

// Zone extra APIs for EventTarget should be available
const w = domino.createWindow('<h1>Hello zone.js</h1>');
const h1 = w.document.querySelector('h1');
const listener = () => {};
h1!.addEventListener('click', listener);
const clickListeners = h1!.eventListeners!('click');
if (!clickListeners || clickListeners.length === 0 || clickListeners[0] !== listener) {
  throw new Error('eventListeners not work!!!');
}

const globalZoneConfig = w as ZoneGlobalConfigurations;
globalZoneConfig.__Zone_disable_EventEmitter = true;
