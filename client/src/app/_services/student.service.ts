import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { GlobalService } from '../_services/global.service';
import { Student } from '../_models/student';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  baseUrl = this.global.apiBase + '/data/student';

  constructor(private httpClient: HttpClient, private global: GlobalService) { }
    
    // get all students
    getAllStudents() {
      return this.httpClient.get<Student[]>(this.baseUrl)
        .pipe(map(response => response));
    }

    // get report stats
    getReportStats() {
      let apiUrl = `${this.baseUrl}/report/stats`;
      return this.httpClient.get<any>(apiUrl);
    }

    // get report stats
    getGradesCustomView(view) {
      let apiUrl = `${this.baseUrl}/report/grades/view/${String(view).toLowerCase()}`;
      return this.httpClient.get<any>(apiUrl);
    }
  
}
