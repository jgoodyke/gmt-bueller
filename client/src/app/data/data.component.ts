import { Component, OnInit } from '@angular/core';
import { StudentService } from '../_services/student.service';
import { first } from 'rxjs/operators';
import { Student } from '../_models/student';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss']
})
export class DataComponent implements OnInit {

  students: Student[];
  studentsLoading = false;

  constructor(private studentService: StudentService) { }

  ngOnInit() {

  }

  getAllStudents() {
    this.students = [];
    this.studentsLoading = true;
    this.studentService.getAllStudents()
      .pipe(first())  
      .subscribe(
        res => {
          this.students = res;
          this.studentsLoading = false;
        },
        err => {
          console.log(err.error);
        }
    );
  }

}
