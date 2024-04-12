// #docregion
import { Component } from '@angular/core';
// #docregion import-message-service
import { MessageService } from '../message.service';
// #enddocregion import-message-service

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent {

  // #docregion ctor
  constructor(public messageService: MessageService) {}
  // #enddocregion ctor

}
