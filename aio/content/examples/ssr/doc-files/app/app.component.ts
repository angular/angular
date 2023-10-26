// Old AppComponent, before refactoring
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-root',
  template: '... the template ...',
  imports: [ RouterLink, RouterOutlet ]
})
export class AppComponent {
  title = 'Tour of Heroes';
}
