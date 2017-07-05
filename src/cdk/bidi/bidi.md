### BidiModule
 
When including the CDK's `BidiModule`, components can inject `Directionality` to get the current
text direction (RTL or LTR);

#### Example
```ts
@Component({ ... }) 
export class MyWidget {
  private isRtl: boolean;
  
  constructor(dir: Directionality) {
    this.isRtl = dir.value === 'rtl';
    
    dir.change.subscribe(() => {
      this.flipDirection();
    });
  }
}  
```

