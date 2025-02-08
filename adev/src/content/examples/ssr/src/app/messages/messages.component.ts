import {Component} from '@angular/core';
import {NgFor, NgIf} from '@angular/common';

import {MessageService} from '../message.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  imports: [NgFor, NgIf],
  styleUrls: ['./messages.component.css'],
})
export class MessagesComponent {
  constructor(public messageService: MessageService) {}
}
