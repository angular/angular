declare var window;

import {Injectable} from 'angular2/di';

// Make sure not to evaluate this in a non-browser environment!
@Injectable()
export class BrowserXHR {
  constructor() { return <any>(new window.XMLHttpRequest()); }
}
