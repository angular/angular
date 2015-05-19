import {Injectable} from 'angular2/di';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {XHR} from './xhr';

@Injectable()
export class XHRImpl extends XHR {
  get(url: string): Promise<string> {
    var completer = PromiseWrapper.completer();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'text';

    xhr.onload = function() {
      var status = xhr.status;
      if (200 <= status && status <= 300) {
        completer.resolve(xhr.responseText);
      } else {
        completer.reject(`Failed to load ${url}`, null);
      }
    };

    xhr.onerror = function() { completer.reject(`Failed to load ${url}`, null); };

    xhr.send();
    return completer.promise;
  }
}
