import { Component } from '@angular/core';

import { MyLibService } from 'projects/my-lib/src/public-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'my-first-app';

  constructor(
    private readonly myLibService: MyLibService
  ) {}

  get name() {
    return this.myLibService.name;
  }
}
