import {Component, inject} from '@angular/core';
import {NgFor, NgIf} from '@angular/common';

import {MessageService} from '../message.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
})
export class MessagesComponent {
  public messageService = inject(MessageService);
}
