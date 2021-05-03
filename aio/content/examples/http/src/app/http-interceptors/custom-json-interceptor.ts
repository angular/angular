import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

// #docregion custom-json-interceptor
// The JsonParser class acts as a base class for custom parsers and as the DI token.
@Injectable()
export abstract class JsonParser {
  abstract parse(text: string): any;
}

@Injectable()
export class CustomJsonInterceptor implements HttpInterceptor {
  constructor(private jsonParser: JsonParser) {}

  intercept(httpRequest: HttpRequest<any>, next: HttpHandler) {
    if (httpRequest.responseType === 'json') {
      // If the expected response type is JSON then handle it here.
      return this.handleJsonResponse(httpRequest, next);
    } else {
      return next.handle(httpRequest);
    }
  }

  private handleJsonResponse(httpRequest: HttpRequest<any>, next: HttpHandler) {
    // Override the responseType to disable the default JSON parsing.
    httpRequest = httpRequest.clone({responseType: 'text'});
    // Handle the response using the custom parser.
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
// #enddocregion custom-json-interceptor

// #docregion custom-json-parser
@Injectable()
export class CustomJsonParser implements JsonParser {
  parse(text: string): any {
    return JSON.parse(text, dateReviver);
  }
}

function dateReviver(key: string, value: any) {
  // #enddocregion custom-json-parser
  if (typeof value !== 'string') {
    return value;
  }
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);
  if (!match) {
    return value;
  }
  return new Date(+match[1], +match[2] - 1, +match[3]);
  // #docregion custom-json-parser
}
// #enddocregion custom-json-parser
