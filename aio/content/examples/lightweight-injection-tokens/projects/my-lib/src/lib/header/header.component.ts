import { Component, OnInit } from '@angular/core';
import { LibHeaderToken } from './lib-header-token';

@Component({
  selector: 'lib-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  providers: [
    {provide: LibHeaderToken, useExisting: HeaderComponent}
  ]
})
export class HeaderComponent extends LibHeaderToken {

  constructor() {
    super();
  }

  ngOnInit() {
  }

  sayHi() {
    console.log('LibHeaderToken.snack: ', LibHeaderToken.snack);
  }
}
