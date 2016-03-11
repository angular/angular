import {Component} from 'angular2/core';
import {HTTP_PROVIDERS, Http, Response} from 'angular2/http';

@Component({
  selector: 'http-request-app',
  template: `
    <span class='val'>{{val}}</span>
    <button class='action' (click)="httpRequest()">Http Request</button>
  `,
  providers: [HTTP_PROVIDERS]
})
export class HttpRequestApp {
  http: Http;
  val: string = 'placeholder';

  constructor(http: Http) { this.http = http; }

  httpRequest(): void {
    this.http.get('slowslowslowdata.json').subscribe((res: Response) => { this.val = res.text(); });
  }
}
