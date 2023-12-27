import { Component } from '@angular/core';
import { NgIf, NgFor, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ContentComponent } from './content.component';

import { Hero, heroes } from './hero';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [ContentComponent, FormsModule, NgIf, NgFor, UpperCasePipe],
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  heroes = heroes;
  hero: Hero | null = this.heroes[0];
  heroTraits = ['honest', 'brave', 'considerate'];

  // flags for the table

  attrDirs = true;
  strucDirs = true;
  divNgIf = false;

  showId = true;
  showDefaultTraits = true;
  showSad = true;
}
