import { Component } from '@angular/core';

import { Service2Service } from 'projects/tools/src/lib/service2/service2.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private readonly service2Service: Service2Service
  ) {}

  get title() {
    return this.service2Service.message;
  }
}
