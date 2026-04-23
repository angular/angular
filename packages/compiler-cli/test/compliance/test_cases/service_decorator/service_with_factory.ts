import {Service} from '@angular/core';

class Alternate {}

@Service({factory: () => new Alternate()})
export class MyService {}
