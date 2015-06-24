import {Injectable} from 'angular2/di';

// Make sure not to evaluate this in a non-browser environment!
@Injectable()
export class BrowserXhr {
  constructor() {}
  build(): any { return <any>(new XMLHttpRequest()); }
}
