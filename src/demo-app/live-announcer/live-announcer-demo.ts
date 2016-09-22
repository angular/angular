import {Component} from '@angular/core';
import {MdLiveAnnouncer} from '@angular/material';

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
