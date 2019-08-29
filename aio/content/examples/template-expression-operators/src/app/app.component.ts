import { Component } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Template Expression Operators';

  item = {
    name : 'Telephone',
    manufactureDate : new Date(1980, 1, 25),
    price: 98
  };

  nullItem = null;

}

