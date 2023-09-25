import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Hero } from './hero';

@Component({
  standalone: true,
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  imports: [FormsModule]
})
export class HeroDetailComponent {
  @Input() hero!: Hero;
}
