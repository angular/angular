// Archived: see only referencing guide, `template-expression-operators.md`.
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';


interface Item {
  name: string;
  manufactureDate: Date;
  color?: string | null;
  price: number;
}

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [ CommonModule ], // no need to enumerate pipes as they are all in CommonModule
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Template Expression Operators';

  item: Item = {
    name : 'Telephone',
    manufactureDate : new Date(1980, 1, 25),
    color: 'orange',
    price: 98,
  };

  nullItem: Item | null = null;

}

