import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'a1', template: 'A1',
    standalone: false
})
export class A1Component {
}

@Component({
    selector: 'a2', template: 'A2',
    standalone: false
})
export class A2Component {
}

@NgModule({declarations: [A1Component, A2Component], exports: [A1Component, A2Component]})
export class AModule {
}

@Component({
    selector: 'b1', template: 'B1',
    standalone: false
})
export class B1Component {
}

@Component({
    selector: 'b2', template: 'B2',
    standalone: false
})
export class B2Component {
}

@NgModule({declarations: [B1Component, B2Component], exports: [AModule]})
export class BModule {
}

@NgModule({imports: [BModule]})
export class AppModule {
}
