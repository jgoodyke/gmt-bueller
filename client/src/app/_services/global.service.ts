import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  apiBase: string = 'http://localhost:3000';

  constructor() { }
}
