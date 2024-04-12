import { InMemoryDbService } from 'angular-in-memory-web-api';

export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const heroes = [
      { id: 12, name: 'Dr. Nice' },
      { id: 13, name: 'Bombasto' },
      { id: 14, name: 'Celeritas' },
      { id: 15, name: 'Magneta' },
    ];
    const query = [
      { name: '@angular/core', version: '20.1.0', description: 'angular core package' },
      { name: '@angular/common', version: '20.1.0', description: 'angular common package' },
      { name: '@angular/material', version: '20.1.5', description: 'angular material package' },
    ];
    return {heroes, query};
  }
}
