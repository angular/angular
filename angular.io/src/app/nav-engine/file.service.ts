declare var fetch;

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';


@Injectable()
export class FileService {

  getFile(url: string): Observable<any> {

    let p: Promise<any>;

    if (!url) {
      const emsg = 'No URL';
      console.error(emsg);
      p = Promise.reject(emsg);
    } else {
      console.log('fetching file at ', url);
      // TODO(robwormald): use Http proper once new API is done.
      p = fetch(url)
        .then(res => res.text())
        .then(content => {
          console.log('fetched file at ', url);
          return content;
        });
    }

    return fromPromise(p);
  }
}
