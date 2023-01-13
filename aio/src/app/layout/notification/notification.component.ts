import { animate, state, style, trigger, transition } from '@angular/animations';
import { Component, EventEmitter, HostBinding, Inject, Input, OnInit, Output } from '@angular/core';
import { CurrentDateToken } from 'app/shared/current-date';
import { LocalStorage } from 'app/shared/storage.service';

const LOCAL_STORAGE_NAMESPACE = 'aio-notification/';

@Component({
  selector: 'aio-notification',
  templateUrl: 'notification.component.html',
  animations: [
    trigger('hideAnimation', [
      state('show', style({height: '*'})),
      state('hide', style({display: 'none', height: 0})),
      // this should be kept in sync with the animation durations in:
      // - aio/src/styles/2-modules/_notification.scss
      // - aio/src/app/app.component.ts : notificationDismissed()
      transition('show => hide', animate(250))
    ])
  ],
  host: { role: 'group', 'aria-label': 'Notification' }
})
export class NotificationComponent implements OnInit {
  @Input() bannerNotficationDescription = 'notification banner.';
  @Input() dismissOnContentClick: boolean;
  @Input() notificationId: string;
  @Input() expirationDate: string;
  @Output() dismissed = new EventEmitter<void>();

  @HostBinding('@hideAnimation')
  showNotification: 'show'|'hide';

  constructor(@Inject(LocalStorage) private storage: Storage, @Inject(CurrentDateToken) private currentDate: Date) {}

  ngOnInit() {
    const previouslyHidden = this.storage.getItem(LOCAL_STORAGE_NAMESPACE + this.notificationId) === 'hide';
    const expired = this.currentDate > new Date(this.expirationDate);
    this.showNotification = previouslyHidden || expired ? 'hide' : 'show';
  }

  contentClick() {
    if (this.dismissOnContentClick) {
      this.dismiss();
    }
  }

  dismiss() {
    this.storage.setItem(LOCAL_STORAGE_NAMESPACE + this.notificationId, 'hide');
    this.showNotification = 'hide';
    this.dismissed.next();
  }
}
