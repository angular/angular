import {
  bootstrap,
  NgIf,
  NgFor,
  Component,
  Directive,
  View,
  Host,
  NgValidator,
  forwardRef,
  Binding
} from 'angular2/bootstrap';

import {Injectable} from 'angular2/core';

import {FORM_DIRECTIVES} from 'angular2/forms';

import {CONST_EXPR} from 'angular2/src/core/facade/lang';


/**
 * You can find the Angular 1 implementation of this example here:
 * https://github.com/wardbell/ng1DataBinding
 */

// ---- model

var _nextId = 1;
class Person {
  personId: number;
  mom: Person;
  dad: Person;
  friends: Person[];

  constructor(public firstName: string, public lastName: string, public yearOfBirth: number) {
    this.personId = _nextId++;
    this.firstName = firstName;
    this.lastName = lastName;
    this.mom = null;
    this.dad = null;
    this.friends = [];
    this.personId = _nextId++;
  }

  get age(): number { return 2015 - this.yearOfBirth; }
  get fullName(): string { return `${this.firstName} ${this.lastName}`; }
  get friendNames(): string { return this.friends.map(f => f.fullName).join(', '); }
}



// ---- services

@Injectable()
class DataService {
  currentPerson: Person;
  persons: Person[];

  constructor() {
    this.persons = [
      new Person('Victor', 'Savkin', 1930),
      new Person('Igor', 'Minar', 1920),
      new Person('John', 'Papa', 1910),
      new Person('Nancy', 'Duarte', 1910),
      new Person('Jack', 'Papa', 1910),
      new Person('Jill', 'Papa', 1910),
      new Person('Ward', 'Bell', 1910),
      new Person('Robert', 'Bell', 1910),
      new Person('Tracy', 'Ward', 1910),
      new Person('Dan', 'Wahlin', 1910)
    ];

    this.persons[0].friends = [0, 1, 2, 6, 9].map(_ => this.persons[_]);
    this.persons[1].friends = [0, 2, 6, 9].map(_ => this.persons[_]);
    this.persons[2].friends = [0, 1, 6, 9].map(_ => this.persons[_]);
    this.persons[6].friends = [0, 1, 2, 9].map(_ => this.persons[_]);
    this.persons[9].friends = [0, 1, 2, 6].map(_ => this.persons[_]);

    this.persons[2].mom = this.persons[5];
    this.persons[2].dad = this.persons[4];
    this.persons[6].mom = this.persons[8];
    this.persons[6].dad = this.persons[7];

    this.currentPerson = this.persons[0];
  }
}



// ---- components

@Component({selector: 'full-name-cmp'})
@View({
  template: `
    <h1>Edit Full Name</h1>
    <div>
      <form>
          <div>
            <label>
              First: <input [(ng-model)]="person.firstName" type="text" placeholder="First name">
            </label>
          </div>

          <div>
            <label>
              Last: <input [(ng-model)]="person.lastName" type="text" placeholder="Last name">
            </label>
          </div>

          <div>
            <label>{{person.fullName}}</label>
          </div>
      </form>
    </div>
  `,
  directives: [FORM_DIRECTIVES]
})
class FullNameComponent {
  constructor(private service: DataService) {}
  get person(): Person { return this.service.currentPerson; }
}

@Component({selector: 'person-detail-cmp'})
@View({
  template: `
    <h2>{{person.fullName}}</h2>

    <div>
      <form>
        <div>
					<label>First: <input [(ng-model)]="person.firstName" type="text" placeholder="First name"></label>
				</div>

        <div>
					<label>Last: <input [(ng-model)]="person.lastName" type="text" placeholder="Last name"></label>
				</div>

        <div>
					<label>Year of birth: <input [(ng-model)]="person.yearOfBirth" type="number" placeholder="Year of birth"></label>
          Age: {{person.age}}
				</div>\

        <div *ng-if="person.mom != null">
					<label>Mom:</label>
          <input [(ng-model)]="person.mom.firstName" type="text" placeholder="Mom's first name">
          <input [(ng-model)]="person.mom.lastName" type="text" placeholder="Mom's last name">
          {{person.mom.fullName}}
				</div>

        <div *ng-if="person.dad != null">
					<label>Dad:</label>
          <input [(ng-model)]="person.dad.firstName" type="text" placeholder="Dad's first name">
          <input [(ng-model)]="person.dad.lastName" type="text" placeholder="Dad's last name">
          {{person.dad.fullName}}
				</div>

        <div *ng-if="person.friends.length > 0">
					<label>Friends:</label>
          {{person.friendNames}}
				</div>
      </form>
    </div>
  `,
  directives: [FORM_DIRECTIVES, NgIf]
})
class PersonsDetailComponent {
  constructor(private service: DataService) {}
  get person(): Person { return this.service.currentPerson; }
}

@Component({selector: 'persons-cmp'})
@View({
  template: `
    <h1>FullName Demo</h1>
    <div>
      <ul>
  		  <li *ng-for="#person of persons">
  			  <label (click)="select(person)">{{person.fullName}}</label>
  			</li>
  	 </ul>

     <person-detail-cmp></person-detail-cmp>
    </div>
  `,
  directives: [FORM_DIRECTIVES, PersonsDetailComponent, NgFor]
})
class PersonsComponent {
  persons: Person[];

  constructor(private service: DataService) { this.persons = service.persons; }

  select(person: Person): void { this.service.currentPerson = person; }
}


@Component({selector: 'person-management-app', viewBindings: [DataService]})
@View({
  template: `
    <button (click)="switchToEditName()">Edit Full Name</button>
    <button (click)="switchToPersonList()">Person Array</button>

    <full-name-cmp *ng-if="mode == 'editName'"></full-name-cmp>
    <persons-cmp *ng-if="mode == 'personList'"></persons-cmp>
  `,
  directives: [FullNameComponent, PersonsComponent, NgIf]
})
class PersonManagementApplication {
  mode: string;

  switchToEditName(): void { this.mode = 'editName'; }
  switchToPersonList(): void { this.mode = 'personList'; }
}

export function main() {
  bootstrap(PersonManagementApplication);
}
