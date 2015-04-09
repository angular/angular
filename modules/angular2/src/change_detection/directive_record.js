export class DirectiveRecord {
  elementIndex:number;
  directiveIndex:number;
  callOnAllChangesDone:boolean;
  callOnChange:boolean;

  constructor(elementIndex:number, directiveIndex:number, 
              callOnAllChangesDone:boolean,
              callOnChange:boolean) {
    this.elementIndex = elementIndex;
    this.directiveIndex = directiveIndex;
    this.callOnAllChangesDone = callOnAllChangesDone;
    this.callOnChange = callOnChange;
  }

  get name() {
    return `${this.elementIndex}_${this.directiveIndex}`;
  }
}