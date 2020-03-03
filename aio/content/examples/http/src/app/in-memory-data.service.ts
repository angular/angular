import { InMemoryDbService } from 'angular-in-memory-web-api';

export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const items = [
      { id: 11, name: 'computer' },
      { id: 12, name: 'phone' },
      { id: 13, name: 'tablet' },
      { id: 14, name: 'watch' },
    ];
    return {items};
  }
}
