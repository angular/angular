import {Component} from '@angular/core';
import {MdLiveAnnouncer} from '../../core/live-announcer/live-announcer';

@Component({
  selector: 'toolbar-demo',
  templateUrl: 'demo-app/live-announcer/live-announcer-demo.html',
})
export class LiveAnnouncerDemo {

  constructor(private live: MdLiveAnnouncer) {}

  announceText(message: string) {
    this.live.announce(message);
  }

}
