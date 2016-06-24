import {Component} from '@angular/core';
import {NgIf, NgFor} from '@angular/common';
import {MdButton} from '@angular2-material/button/button';
import {MD_LIST_DIRECTIVES} from '@angular2-material/list/list';
import {MdIcon} from '@angular2-material/icon/icon';

@Component({
  moduleId: module.id,
  selector: 'list-demo',
  templateUrl: 'list-demo.html',
  styleUrls: ['list-demo.css'],
  directives: [MD_LIST_DIRECTIVES, MdButton, MdIcon, NgIf, NgFor]
})
export class ListDemo {
  items: string[] = [
    'Pepper',
    'Salt',
    'Paprika'
  ];

  contacts: any[] = [
    {name: 'Nancy', headline: 'Software engineer'},
    {name: 'Mary', headline: 'TPM'},
    {name: 'Bobby', headline: 'UX designer'}
  ];

  messages: any[] = [
    {
      from: 'Nancy',
      subject: 'Brunch?',
      message: 'Did you want to go on Sunday? I was thinking that might work.',
      image: 'https://angular.io/resources/images/bios/julie-ralph.jpg'
    },
    {
      from: 'Mary',
      subject: 'Summer BBQ',
      message: 'Wish I could come, but I have some prior obligations.',
      image: 'https://angular.io/resources/images/bios/juleskremer.jpg'
    },
    {
      from: 'Bobby',
      subject: 'Oui oui',
      message: 'Do you have Paris reservations for the 15th? I just booked!',
      image: 'https://angular.io/resources/images/bios/jelbourn.jpg'
    }
  ];

  links: any[] = [
    {name: 'Inbox'},
    {name: 'Outbox'},
    {name: 'Spam'},
    {name: 'Trash'}

  ];

  thirdLine: boolean = false;
  infoClicked: boolean = false;
}
