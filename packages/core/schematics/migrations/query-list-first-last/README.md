## entryComponents migration
In Angular version 14, the types of the `QueryList`'s `first` and `last` fields have been extended with `undefined` (that is how they always behaved but their types did not reflect that). This migration automatically identifies usages and adds non-null assertions.

#### Before
```ts
import { Component, QueryList, ViewChildren } from '@angular/core';
import { NotificationComponent } from './notification/notification.component';

@Component({
  selector: 'my-comp',
  templateUrl: './my-comp.component.html',
  styleUrls: ['./my-comp.component.scss']
})
export class MyComponent {
  @ViewChildren(NotificationComponent) notifications!: QueryList<NotificationComponent>;

  getFirstNotificationMessage() {
    return this.notifications.first.message;
  }

  getLastNotificationMessage() {
    return this.notifications.last.message;
  }
}
```

#### After
```ts
import { Component, QueryList, ViewChildren } from '@angular/core';
import { NotificationComponent } from './notification/notification.component';

@Component({
  selector: 'my-comp',
  templateUrl: './my-comp.component.html',
  styleUrls: ['./my-comp.component.scss']
})
export class MyComponent {
  @ViewChildren(NotificationComponent) notifications!: QueryList<NotificationComponent>;

  getFirstNotificationMessage() {
    return this.notifications.first!.message;
  }

  getLastNotificationMessage() {
    return this.notifications.last!.message;
  }
}
```
