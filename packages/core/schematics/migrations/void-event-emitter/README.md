## Void EventEmitter migration

Updates type parameter for `EventEmitter` constructor call in scenarios where the emitter is used without arguments.

It analyzes both `.emit` and `.next` method calls. Method calls are tracked in the class itself and in its template, if any. 

#### Before
```ts
class MyComponent {
 @Output() myEvent = new EventEmitter();
 
 onClick() {
     this.myEvent.emit();
 }
}
```

#### After
```ts
class MyComponent {
  @Output() myEvent = new EventEmitter<void>();

  onClick() {
    this.myEvent.emit();
  }
}
```
