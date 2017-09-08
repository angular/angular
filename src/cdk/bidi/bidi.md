### BidiModule
 
When including the CDK's `BidiModule`, components can inject `Directionality` to get the current
text direction (RTL or LTR);

#### Example
```ts
@Component({ ... }) 
export class MyWidget implements OnDestroy {

  /** Whether the widget is in RTL mode or not. */
  private isRtl: boolean;
  
  /** Subscription to the Directionality change EventEmitter. */
  private _dirChangeSubscription = Subscription.EMPTY;  
  
  constructor(dir: Directionality) {
    this.isRtl = dir.value === 'rtl';
    
    _dirChangeSubscription = dir.change.subscribe(() => {
      this.flipDirection();
    });
  }
  
  ngOnDestroy() {
    this._dirChangeSubscription.unsubscribe();
  }
}  
```

