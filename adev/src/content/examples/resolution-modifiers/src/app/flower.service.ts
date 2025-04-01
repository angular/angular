import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root', // provide this service in the root ModuleInjector
})
export class FlowerService {
  emoji = '🌸';
}
