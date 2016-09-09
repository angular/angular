/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// #docregion Component
import {Pipe, ViewChild, Input, Output, Component, EventEmitter, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';

@Pipe({
  name: "orderBy"
})
export class OrderByPipe {
  transform(array: Array<string>, field: string): Array<string> {
    if (field) {
      array.sort((value1:any, value2:any) => {
        var a = value1[field];
        var b = value2[field];
        if (a < b) {
          return -1;
        } else if (a > b) {
          return 1;
        } else {
          return 0;
        }
      });
    }
    return array;
  }
}

@Component({
  selector: 'example-app',
  template: `
    <nav class="actions">
      <button class="button" (click)="createBlankMessage()">+ New Message</button> 
      |
      <button class="button" (click)="sortBySubject()">Sort By Subject</button> 
      <button class="button" (click)="sortById()">Sort By Id</button> 
      <button class="button" (click)="randomize()">Randomize Order</button> 
    </nav>
    
    <div class="record message-record" *ngFor="let message of messages | orderBy: order; let index=index; trackBy: trackMessage">
      <div class="inner">
        <h1>{{ index + 1 }}. {{ message.subject }}</h1>
        <p>{{ message.content }}</p>
        <nav class="record-actions">
          <button (click)="toggleEditMessage(message)" class="button">Edit</button> 
          <button (click)="removeMessage(message)" class="button">Remove</button> 
        </nav>
      </div>
      
      <message-form
        class="inner"
        [message]="message"
        (submit)="onMessageSaved(message)"
        *ngIf="message.edit"></message-form>
    </div>
  `
})
export class ExampleApp {
  order: string = null;
  messages: Message[] = [];

  constructor() {
    this.createNewMessage("Angular 2.0 is out!", "Yes finally...");
    this.createNewMessage("Animations", "Wait until you see the fancy animation DSL.");
    this.createNewMessage("AOT", "If you don't know what this is then you need to explore it!");
  }

  trackMessage(index, message: Message) {
    return message.id;
  }

  sortBySubject() {
    this.order = 'subject';
  }

  sortById() {
    this.order = 'id';
  }

  randomize() {
    this.messages = this.messages.sort((a,b) => {
      return .5 - Math.random();
    })
  }

  removeMessage(message: Message) {
    var index = this.messages.indexOf(message);
    this.messages.splice(index, 1);
  }

  toggleEditMessage(message: Message) {
    if (message.edit) {
      message.edit = false;
    } else {
      message.edit = true;
    }
  }

  onMessageSaved(message: Message) {
    message.edit = false;
  }

  createNewMessage(subject, content): Message {
    var id = this.messages.length;
    var message = new Message(id, subject, content);
    this.messages.push(message);
    return message;
  }

  createBlankMessage() {
    var message = this.createNewMessage("","");
    this.toggleEditMessage(message);
  }
}
// #enddocregion

@Component({
  selector: 'message-form',
  template: `
    <form (submit)="submit($event)">
      <div class="form-field">
        <label>Subject:</label>
        <input type="text"
          [(ngModel)]="message.subject" [ngModelOptions]="{standalone: true}" #subject>
      </div>
      <div class="form-field">
        <label>Content:</label>
        <textarea [(ngModel)]="message.content" [ngModelOptions]="{standalone: true}"></textarea>
      </div>
      <nav>
        <input type="submit" class="button" value="Submit"> 
      </nav>
    </form>
  `
})
class MessageFormCmp {
  @Output('submit')
  public onSubmitted = new EventEmitter();

  @Input('message')
  public actualMessage: Message;
  public message = new Message(0,"","");

  @ViewChild('subject')
  public subjectRef: any;

  ngOnInit() {
    this.subjectRef.nativeElement.focus();
    this.message.subject = this.actualMessage.subject;
    this.message.content = this.actualMessage.content;
  }

  submit(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.actualMessage.subject = this.message.subject;
    this.actualMessage.content = this.message.content;
    this.onSubmitted.next(this.actualMessage)
  }
}

class Message {
  public edit: boolean = false;
  constructor(public id, public subject, public content) {}
}

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [ExampleApp, MessageFormCmp, OrderByPipe],
  bootstrap: [ExampleApp]
})
export class AppModule {
}
