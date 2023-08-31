import { Component } from '@angular/core';
import { MessageService } from '../message.service';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'app-messages',
    templateUrl: './messages.component.html',
    styleUrls: ['./messages.component.css'],
    standalone: true,
    imports: [NgIf, NgFor]
})
export class MessagesComponent {

  constructor(public messageService: MessageService) {}

}
