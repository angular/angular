import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'card',
    template: `
		<ng-content select="[card-title]"></ng-content>
		---
		<ng-content select="[card-content]"></ng-content>
	`,
    standalone: false
})
class Card {
}

@Component({
    selector: 'card-with-title',
    template: `
		<card>
			<h1 ngProjectAs="[card-title]">Title</h1>
			<ng-content ngProjectAs="[card-content]"></ng-content>
		</card>
	`,
    standalone: false
})
class CardWithTitle {
  foo: any;
}

@Component({
    selector: 'app',
    template: `
		<card-with-title>content</card-with-title>
	`,
    standalone: false
})
class App {
}

@NgModule({declarations: [Card, CardWithTitle, App]})
class Module {
}
