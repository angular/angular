import { Injectable } from '@angular/core';
import { Http, Headers, Response, ResponseOptions, ResponseType} from '@angular/http';
export { Response }

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';

import { FileLoaderService} from './file-loader.service';

@Injectable()
export class HttpFileLoaderService {

  constructor(private http: Http) {}

  load(path: string) {
    if (!path) {
      const options = {
        url: path, status: 400, statusText: 'Bad Request', body: 'No url',
        type: ResponseType.Default, headers: new Headers()
      };
      const resp = new Response(new ResponseOptions(options));
      return Observable.throw(resp);
    }
    return this.http.get('content/' + path);
  }
}

export const FileLoaderProviders = [
  { provide: FileLoaderService, useClass: HttpFileLoaderService }
];
