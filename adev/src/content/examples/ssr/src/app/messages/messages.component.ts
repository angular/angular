import {Component} from '@angular/core';

import {MessageService} from '../message.service';

@Component({
  standalone: true,
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  imports: [],
  styleUrls: ['./messages.component.css'],
})
export class MessagesComponent {
  constructor(public messageService: MessageService) {}
}
