import { FileLoaderService, Response } from 'app/shared/file-loader.service';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Observer } from 'rxjs/Observer';

export class TestConnection {
    constructor(
      public url: string,
      private observer: Observer<Response>
    ) { }

    mockRespond(body: any, options = {}) {
      body = options['body'] || body;

      let json: () => any;
      let text: () => string;

      if (typeof body === 'string') {
        json = () => JSON.parse(body || '{}');
        text = () => body;
      } else {
        json = () => body;
        text = () => JSON.stringify(body);
      }

      const response = {...{
          ok: true,
          url: this.url,
          status: 200,
          statusText: 'ok',
          text,
          json
      }, ...options};

      response.ok = response.status >= 200 && response.status < 300;

      if (response.ok) {
        this.observer.next(response);
        this.observer.complete();
      } else {
        this.observer.error(response);
      }
    }
}

export class TestFileLoaderService {
  private connectionSubject = new Subject<TestConnection>();
  connections = this.connectionSubject as Observable<TestConnection>;
  connectionsArray: TestConnection[] = [];

  load(url: string) {
    return new Observable(observer => {
      const connection = new TestConnection(url, observer);
      this.connectionsArray.push(connection);
      this.connectionSubject.next(connection);
    });
  }
}
