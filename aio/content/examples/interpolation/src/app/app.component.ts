import { Component } from '@angular/core';

import { CUSTOMERS } from './customers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  customers = CUSTOMERS;

  currentCustomer = 'Maria';
  title = 'Featured product:';
  itemImageUrl: any = '../assets/typewriter.png';

  recommended = 'You might also like:';
  itemImageUrl2: any = '../assets/cobra.gif';



  getVal(): number { return 2; }


}
