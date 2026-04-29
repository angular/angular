# Angular Facade Pattern

The Facade Pattern is a structural design pattern that provides a simplified interface to a complex system of classes, a library, or a framework. In Angular, it is often used as a middle layer between components and the application's business logic, state management (like NgRx or Signals), and HTTP API services.

## Benefits of the Facade Pattern

- **Encapsulation**: Hides complex business logic and state management behind a clean interface.
- **Reusability**: Components become independent of how state is managed, allowing the facade to be reused across multiple components.
- **Maintainability**: Centralizes logic, making it easier to update or swap underlying implementations (e.g., migrating from RxJS Subjects to Signals) without touching components.
- **Testability**: Simplifies unit testing of components by allowing you to mock the Facade instead of multiple underlying services.

## Implementation Steps

### 1. Create a State Management / API Service

This service is responsible for handling the actual data fetching and state updates. Use Signals for reactive state and `resource()` for async data loading.

```ts
import {Injectable, signal, inject, resource} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {User} from '../models/user.model';

@Injectable({providedIn: 'root'})
export class UserService {
  private http = inject(HttpClient);

  private usersSignal = signal<User[]>([]);
  // Expose as readonly so it can't be mutated from outside
  users = this.usersSignal.asReadonly();

  async loadUsers(): Promise<void> {
    const data = await firstValueFrom(this.http.get<User[]>('/api/users'));
    this.usersSignal.set(data);
  }

  addUser(user: User) {
    this.usersSignal.update((current) => [...current, user]);
  }
}
```

### 2. Create the Facade Service

The Facade service wraps the state service and provides a simplified, focused API for components. It shouldn't contain heavy business logic but rather orchestrate calls to various services.

```ts
import {Injectable, inject} from '@angular/core';
import {UserService} from './user.service';
import {User} from '../models/user.model';

@Injectable({providedIn: 'root'})
export class UserFacade {
  private userService = inject(UserService);

  // Expose state as a readonly signal to components
  users = this.userService.users;

  loadUsers() {
    return this.userService.loadUsers();
  }

  addUser(user: User) {
    this.userService.addUser(user);
  }
}
```

### 3. Use the Facade in a Component

The component only interacts with the Facade. It remains unaware of the `HttpClient` or how the state is stored. Components are standalone by default in modern Angular.

```ts
import {Component, inject} from '@angular/core';
import {UserFacade} from './facades/user.facade';

@Component({
  selector: 'app-user-list',
  template: `
    @for (user of users(); track user.id) {
      <div>{{ user.name }}</div>
    } @empty {
      <div>No users found.</div>
    }
    <button (click)="load()">Load Users</button>
  `,
})
export class UserList {
  private userFacade = inject(UserFacade);

  // Bind directly to the facade's signals
  users = this.userFacade.users;

  constructor() {
    // Load users on initialization
    this.userFacade.loadUsers();
  }

  load() {
    this.userFacade.loadUsers();
  }
}
```

## Testing the Facade Service

Use Vitest to unit test the Facade by mocking the underlying service. This ensures your facade behaves correctly without making real HTTP requests.

```ts
import {TestBed} from '@angular/core/testing';
import {UserFacade} from './user.facade';
import {UserService} from './user.service';
import {vi, describe, beforeEach, it, expect} from 'vitest';

describe('UserFacade', () => {
  let facade: UserFacade;
  let userServiceMock: {loadUsers: ReturnType<typeof vi.fn>; addUser: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    userServiceMock = {
      loadUsers: vi.fn(),
      addUser: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [UserFacade, {provide: UserService, useValue: userServiceMock}],
    });

    facade = TestBed.inject(UserFacade);
  });

  it('should delegate loadUsers to UserService', () => {
    facade.loadUsers();
    expect(userServiceMock.loadUsers).toHaveBeenCalled();
  });

  it('should delegate addUser to UserService', () => {
    const user = {id: 1, name: 'Test'};
    facade.addUser(user);
    expect(userServiceMock.addUser).toHaveBeenCalledWith(user);
  });
});
```

## Considerations

While powerful, the Facade Pattern is not always necessary:

- **Increased Complexity**: It might be overkill for simple applications or simple CRUD views.
- **Potential for Over-Abstraction**: Can make debugging harder if layers are too thick.
- **Extra Boilerplate**: Requires creating additional files and services.
- **Risk of "God Service"**: If not careful, the Facade can become too large and hold too much unrelated logic. Keep facades focused on specific domains (e.g., `UserFacade`, `ProductFacade`).
