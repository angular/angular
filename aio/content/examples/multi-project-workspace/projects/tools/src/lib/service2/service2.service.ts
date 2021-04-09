import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Service2Service {
  get message(): string {
    return 'Message from service 2';
  }
}
