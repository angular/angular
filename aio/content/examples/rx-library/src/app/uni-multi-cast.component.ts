// #docplaster
import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Observable, interval, shareReplay, Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-uni-multi-cast',
  template: `
  <b>Unicast Subscriber(s):</b>
  <div *ngIf="unicastSubscribers.length; else noUni">
    <div *ngFor="let uni of unicastSubscribers">{{uni}}</div>
  </div>
  <ng-template #noUni>
    <div ><i>no unicast subscribers</i></div>
  </ng-template>
<br>
  <b>Multicast ShareReplay Subscriber(s):</b>
  <div *ngIf="shareReplaySubscribers.length; else noMulti">
    <div *ngFor="let multi of shareReplaySubscribers">{{multi}}</div>
  </div>
  <ng-template #noMulti>
    <div><i>no multicast shareReplay subscribers</i></div>
  </ng-template>


  <div>
    <button type="button" (click)="addUnicastSubscriber()">Add Unicast Subscriber</button>
    <button type="button" (click)="addShareReplaySubscriber()">Add Multicast Subscriber</button>
    <button type="button" (click)="unsubscribeAll()">Unsubscribe All</button>
  </div>
  `,
  imports: [ CommonModule],
  styleUrls: ['./app.component.css']
})
export class UniMultiCastComponent implements OnDestroy {
  // #docregion unicast-observable
  /** Unicast observable that emits integers every 1/2 second. */
  numbers$: Observable<number> = interval(500);
  // #enddocregion unicast-observable

  // #docregion shareReplay-observable
  /** Multicast the interval by extending `numbers$` with `shareReplay` */
  multiCastNumber$ = this.numbers$.pipe(
    // Replay 1 item; never forgets, never completes.
    shareReplay({ bufferSize: 1, refCount: false })
  );
  // #enddocregion shareReplay-observable

  unicastSubscribers = [] as string[];
  shareReplaySubscribers = [] as string[];
  subscriptions = new Subscription();

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  addUnicastSubscriber() {
    const index = this.unicastSubscribers.length;
    const id = index + 1;
    this.unicastSubscribers[index] = `Unicast Subscriber #${id} added`;

    // Add a subscriber to the unicast observable
    const newSubscription = this.numbers$.subscribe(num => {
      this.unicastSubscribers[index] = `Unicast Subscriber #${id} received ${num}`;
    });

    this.subscriptions.add(newSubscription);
  }

  addShareReplaySubscriber() {
    const index = this.shareReplaySubscribers.length;
    const id = index + 1;
    this.shareReplaySubscribers[index] = `ShareReplay Subscriber #${id} added`;

    // Add a subscriber to the multicast observable
    const newSubscription = this.multiCastNumber$.subscribe(num => {
      this.shareReplaySubscribers[index] = `ShareReplay Subscriber #${id} received ${num}`;
    });

    this.subscriptions.add(newSubscription);
  }

  unsubscribeAll() {
    this.subscriptions.unsubscribe(); // unsubscribe all
    this.subscriptions = new Subscription();

    this.unicastSubscribers[this.unicastSubscribers.length] =
    this.shareReplaySubscribers[this.shareReplaySubscribers.length] =
      '-- unsubscribed --';
  }
}
