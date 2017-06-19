import { Component, OnInit } from '@angular/core';

import { HelperService } from '../services/helper.service';

@Component({
  selector: 'app-managing-focus',
  templateUrl: './managing-focus.component.html'
})
export class ManagingFocusComponent implements OnInit {
  countriesWorkedIn: Array<string>;
  buttonClicks = 0;

  constructor(private helper: HelperService) {
  }

  onClick(): void {
    this.buttonClicks++;
  }

  generateButtonString(): string {
    return `Button has been clicked ${this.buttonClicks} times`;
  }

  ngOnInit(): void {
    this.countriesWorkedIn = this.helper.getCountriesWorkedIn();
  }

}
