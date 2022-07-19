import { Component, OnInit } from '@angular/core';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {

  messages: string[] = [];

  constructor(public messageService: MessageService) {}

  ngOnInit(): void {
    this.messages = [...this.messageService.messages];
  }

  clear(){
    this.messageService.clear();
  }

}
