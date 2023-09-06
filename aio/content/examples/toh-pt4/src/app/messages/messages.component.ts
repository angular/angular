// #docregion
import {Component} from '@angular/core';
// #docregion import-message-service
import {MessageService} from '../message.service';
// #enddocregion import-message-service
import {NgIf, NgFor} from '@angular/common';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
  standalone: true,
  imports: [NgIf, NgFor],
})
export class MessagesComponent {
  // #docregion ctor
  constructor(public messageService: MessageService) {}
  // #enddocregion ctor
}
