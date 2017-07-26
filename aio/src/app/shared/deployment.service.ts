import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable()
export class Deployment {
  mode: string = environment.mode;
};
