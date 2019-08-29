import { Injectable } from '@angular/core';

@Injectable()
export class ToastService {
  activate: (message?: string, title?: string) => void;
}
