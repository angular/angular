## QueryList.changes() migration

Until Angular v16, `QueryList.changes` returned a loose `Observable<any>`. 

With v16, the return type has been improved to match the generic type : `Observable<QueryList<T>>`. 

This migration intends to ease the migration by adding a `Observable<any>` assertion on each `QueryList.changes`. 
This is espacially usefull when there is an incompatible assertion for exemple (`Observable<Array<T>>`).


#### Before
```ts
import { QueryList, ViewChildren } from '@angular/core';
import { ChildComponent } from './child.component';

@Injectable({providedIn: 'root'})
export class MyClass implements OnInit {
  @ViewChildren('child') childrenList: QueryList<ChildComponent>;

  ngOnInit() {
    (this.childrenList.changes as Observable<Array<T>>).subscribe(() = { ...  }) 
  }
}
```

#### After
```ts
import { QueryList, ViewChildren } from '@angular/core';
import { ChildComponent } from './child.component';

@Injectable({providedIn: 'root'})
export class MyClass implements OnInit {
  @ViewChildren('child') childrenList: QueryList<ChildComponent>;

  ngOnInit() {
    ((this.childrenList.changes as Observable<any>) as Observable<Array<T>>).subscribe(() = { ...  }) 
  }
}
```