import {Component} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';

import {PLATFORM_ID, APP_ID, Inject} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';

import {MessagesComponent} from './messages/messages.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterLink, RouterOutlet, MessagesComponent],
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Tour of Heroes';

  constructor(@Inject(PLATFORM_ID) platformId: object, @Inject(APP_ID) appId: string) {
    const platform = isPlatformBrowser(platformId) ? 'in the browser' : 'on the server';
    console.log(`Running ${platform} with appId=${appId}`);
  }
}
