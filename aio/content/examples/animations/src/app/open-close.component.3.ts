// #docplaster
// #docregion reusable
import { Component } from '@angular/core';
import { useAnimation, transition, trigger, style, animate } from '@angular/animations';
import { transAnimation } from './animations';

@Component({
// #enddocregion reusable
  selector: 'app-open-close-reusable',
// #docregion runtime
  animations: [
    transition('open => closed', [
      style({
        height: '200 px',
        opacity: '{{ opacity }}',
        backgroundcolor: 'yelow'
      }),
      animate('{{ time }}'),
    ], {
        params: {
          time: '1s',
          opacity: '1'
        }
      }),
// #enddocregion runtime
// #docregion reusable
    trigger('openClose', [
      transition('open => closed', [
        useAnimation(transAnimation, {
          params: {
            height: 0,
            opacity: 1,
            backgroundColor: 'red',
            time: '1s'
          }
        })
      ])
    ])
// #docregion runtime
  ],
// #enddocregion runtime
// #enddocregion reusable
  templateUrl: 'open-close.component.html',
  styleUrls: ['open-close.component.css']
// #docregion reusable
})
// #enddocregion reusable
export class OpenCloseReusableComponent { }
