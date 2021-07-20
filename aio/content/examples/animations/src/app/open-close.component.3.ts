// #docplaster
// #docregion reusable
import { Component } from '@angular/core';
import { transition, trigger, useAnimation } from '@angular/animations';
import { transitionAnimation } from './animations';

@Component({
  selector: 'app-open-close-reusable',
  animations: [
    trigger('openClose', [
      transition('open => closed', [
        useAnimation(transitionAnimation, {
          params: {
            height: 0,
            opacity: 1,
            backgroundColor: 'red',
            time: '1s'
          }
        })
      ])
    ])
  ],
  templateUrl: 'open-close.component.html',
  styleUrls: ['open-close.component.css']
})
// #enddocregion reusable
export class OpenCloseReusableComponent { }
