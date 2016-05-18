import {Component} from '@angular/core';
import {MdLiveAnnouncer} from '@angular2-material/core/live-announcer/live-announcer';

@Component({
  moduleId: module.id,
  selector: 'toolbar-demo',
  templateUrl: 'live-announcer-demo.html',
})
export class LiveAnnouncerDemo {

  constructor(private live: MdLiveAnnouncer) {}

  announceText(message: string) {
    this.live.announce(message);
  }

}
