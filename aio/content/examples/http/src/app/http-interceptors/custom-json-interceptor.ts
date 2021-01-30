import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

// #docregion custom-json-interceptor
@Injectable()
export class CustomJsonInterceptor implements HttpInterceptor {
  constructor(private jsonParser: JsonParser) {}

  intercept(httpRequest: HttpRequest<any>, next: HttpHandler) {
    if (httpRequest.responseType !== 'json') {
      return next.handle(httpRequest);
    } else {
      return this.handleJsonResponse(httpRequest, next);
    }
  }

  private handleJsonResponse(httpRequest: HttpRequest<any>, next: HttpHandler) {
    httpRequest = httpRequest.clone({responseType: 'text'});
    return next.handle(httpRequest).pipe(map(event => this.parseJsonResponse(event)));
  }

  private parseJsonResponse(event: HttpEvent<any>) {
    if (event instanceof HttpResponse && typeof event.body === 'string') {
      return event.clone({body: this.jsonParser.parse(event.body)});
    } else {
      return event;
    }
  }
}

@Injectable()
export class JsonParser {
  parse(text: string): any {
    return JSON.parse(text);
  }
}
// #enddocregion custom-json-interceptor

// #docregion custom-json-parser
@Injectable()
export class CustomJsonParser implements JsonParser {
  parse(text: string): any {
    return JSON.parse(text, dateReviver);
  }
}

function dateReviver(key: string, value: any) {
  if (typeof value !== 'string') {
    return value;
  }
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);
  if (!match) {
    return value;
  }
  return new Date(+match[1], +match[2] - 1, +match[3]);
}
// #enddocregion custom-json-parser
