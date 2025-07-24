import {Component} from '@angular/core';
import {DomSanitizer, SafeHtml, SafeResourceUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false,
})
export class AppComponent {
  title = 'trusted-types';
  html = `<span>Hello from bound HTML</span><iframe id="bound-html-iframe"></iframe>`;
  iframeHtml = `<h1>Hello from iframe</h1>`;
  replace = `<span>Hello from second outerHTML</span>`;
  safeHtml: SafeHtml;
  safeResourceUrl: SafeResourceUrl;

  constructor(sanitizer: DomSanitizer) {
    this.safeHtml = sanitizer.bypassSecurityTrustHtml(
      `<span>Hello from bound SafeHtml</span><iframe id="bound-safehtml-iframe"></iframe>`,
    );
    this.safeResourceUrl = sanitizer.bypassSecurityTrustResourceUrl(
      `data:text/html,<body><h1>Hello from object</h1></body>`,
    );
  }
}
