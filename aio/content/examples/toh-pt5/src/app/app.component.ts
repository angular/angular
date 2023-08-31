import { Component } from '@angular/core';
import { MessagesComponent } from './messages/messages.component';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [RouterLink, RouterOutlet, MessagesComponent]
})
export class AppComponent {
  title = 'Tour of Heroes';
}
