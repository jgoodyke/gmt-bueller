import { Component, OnInit } from '@angular/core';
import { StudentService } from '../_services/student.service';
import { first } from 'rxjs/operators';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  
  // chart: population - schools
  chartPopSchoolsLoading = false;
  chartPopSchools: any;
    
  // chart: population - custom
  customView = '';
  chartPopCustomLoading = false;
  chartPopCustom: any = [];
  chartPopCustomTitle = '';
  chartPopCustomReport = null;

  // chart: correlation
  correlationField1 = '';
  correlationField1Type = '';
  correlationField2 = '';
  correlationField2Type = '';
  correlationChartLoading = false;
  chartCorrelation: any = [];

  // chart: correlation
  chartCorrelationBinaryLoading = false;
  chartCorrelationBinary: any = [];

  students: any = [];
  reportStats: any;
  reportStatsLoaded = false;

  constructor(private studentService: StudentService) { }

  ngOnInit() {
    // load report stats
    this.getReportStats();
  }

  // subscribes to studentService to get all student data
  getAllStudents() {
    this.studentService.getAllStudents()
      .subscribe(
        res => {
          this.students = res;
        },
        err => console.log(err.error)
    );
  }

  // subscribes to studentService to get report stats
  getReportStats() {
    this.studentService.getReportStats()
      .subscribe(
        res => {
          this.reportStatsLoaded = true;
          this.reportStats = res;
          // calculate male and female percent population
          this.reportStats.malePercent = (this.reportStats.studentCount) ? Math.round(((this.reportStats.maleCount / this.reportStats.studentCount) * 100) * 10) / 10 : 0;
          this.reportStats.femalePercent = (this.reportStats.studentCount) ? Math.round(((this.reportStats.femaleCount / this.reportStats.studentCount) * 100) * 10) / 10 : 0;
          // calculate male and female percent for each school population
          this.reportStats.schoolStats.forEach(school => {
            school.malePercent = (school.studentCount) ? Math.round(((school.maleCount / school.studentCount) * 100) * 10) / 10 : 0;
            school.femalePercent = (school.studentCount) ? Math.round(((school.femaleCount / school.studentCount) * 100) * 10) / 10 : 0;
          })
          console.log(this.reportStats);

          this.onChangeCustomView('traveltime'); // preload custom report view section by selecting 'traveltime' field
          this.genChart_chartPopSchools(); // generate chart for school population comparison
          this.getChart_chartCorrelationBinary(); // generate radar chart for binary field comparisons to avg final grade
        },
        err => console.log(err.error)
    );
  }

  // when the custom field view is changed, subscribe to student service to get specific view (field) stats
  onChangeCustomView(selectedView) {
    this.chartPopCustomLoading = true;
    this.studentService.getGradesCustomView(selectedView)
      .subscribe(
        res => {
          this.customView = selectedView;
          this.chartPopCustomReport = res;
          // generate custom population charts for specific view selected
          this.genChart_chartPopCustom(res);
        },
        err => {
          console.log(err.error);
        }
    );
  }

  // when field1 or field2 is changed to a new value for the correlation chart, save selected field value and type.
  // 'dataType' is only being used becuase I originally had plans to show different graphs per different data types selected...never added that in.
  onChangeCorrelationField(field, target) {
    let dataType = target.options[target.selectedIndex].getAttribute('datatype');

    if (field === 'field1') {
      this.correlationField1 = target.value;
      this.correlationField1Type = dataType;
    }
    if (field === 'field2') {
      this.correlationField2 = target.value;
      this.correlationField2Type = dataType;
    }
  }

  // subscribe to studentService to get all student data to be used in scatter plot for correlation evaluation
  loadCorrelationChart() {
    // both fields must be selected prior to continuing
    if (this.correlationField1.length && this.correlationField2.length) {
      this.correlationChartLoading = true;

      // both fields must be same type.  Again, planned to add other types with different actions, just never did.
      if (this.correlationField1Type === this.correlationField2Type) {
        this.studentService.getAllStudents()
          .pipe(first())  
          .subscribe(
            res => {
              let studentData = res;
              this.correlationChartLoading = false;

              // select the chart type based on types of fields selected to compare
              switch (this.correlationField1Type) {
                case 'numeric':
                  this.genChart_chartCorrelationNumeric(studentData);
                  break;
              }
            },
            err => console.log(err.error)
        );
      } else {
        // do something to let the user know they need to select like fields
      }
    }
  }

  // generate scatter chart to compare different field types
  genChart_chartCorrelationNumeric(studentData) {
    let data = studentData.map(data => ({x: data[this.correlationField1], y: data[this.correlationField2]}));
    console.log(studentData);

    if (this.chartCorrelation.id) this.chartCorrelation.destroy();

    // build chart
    this.chartCorrelation = new Chart('chartCorrelation', {
      type: 'scatter',
      data: {
          datasets: [{
              label: 'Correlation Data',
              data: [...data],
              pointRadius: 5
          }]
      },
      options: {
          scales: {
              xAxes: [{
                  type: 'linear',
                  position: 'bottom',
                  scaleLabel: {
                    display: true,
                    labelString: this.correlationField1
                  }
              }],
              yAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: this.correlationField2
                }
            }]
          }
      }
    });
  }

  // generate radar chart to compare different binary data to grade outcome
  getChart_chartCorrelationBinary() {
    // calc absolute different of overall grade between 'yes' and 'no' binary data
    this.reportStats.binaryStats.map(stat => {
      stat.absDiff = Math.round(Math.abs(stat.yes - stat.no) * 10) / 10;
      return stat;
    })
    // prepare the labels and data
    let labels = this.reportStats.binaryStats.map(stat => stat.label);
    let data1 = this.reportStats.binaryStats.map(stat => stat.yes);
    let data2 = this.reportStats.binaryStats.map(stat => stat.no);

    // build chart
    this.chartCorrelationBinary = new Chart('chartCorrelationBinary', {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: "Yes",
          backgroundColor: "rgba(200,0,0,0.2)",
          data: data1
        }, {
          label: "No",
          backgroundColor: "rgba(0,0,200,0.2)",
          data: data2
        }]
      },
      options: {
        responsive: true, 
        maintainAspectRatio: true,
        title: {text: 'Avg Grade by Student Situation', display: true}
      }
    });
  }

  // generate doughnut chart to show difference in population in schools
  genChart_chartPopSchools() {
    // prepare data and labels
    let data = this.reportStats.schoolStats.map(data => data.studentCount);
    let labels = this.reportStats.schoolStats.map(data => data.name);

    // build chart
    this.chartPopSchools = new Chart('chartPopSchools', {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#0393b8', '#569a45']
        }]
      },
      options: {
        responsive: true, 
        maintainAspectRatio: false,
        title: {text: 'Student Sample per Secondary School', display: true}
      }
    });
  }

  // generate custom population charts based on user selection
  genChart_chartPopCustom(report) {
    // calc percent of population represented by each sample as it is selected
    this.chartPopCustomReport.data.map(data => {
      data.samplePercent = (data.sampleSize) ? Math.round(((data.subSampleSize / data.sampleSize) * 100) * 10) / 10 : 0;
      return data;
    });

    // prep data and labels
    let chartColors = ['rgba(3, 147, 184, 0.5)', 'rgba(86, 154, 69, 0.5)'];
    let datasets = [{data: report.data.map(data => data.avgGrade), label: 'Sample Avg', backgroundColor: chartColors[0]}];
    let popDataset = {data: report.data.map(data => this.reportStats.g3Avg), label: 'Population Avg', type: 'line', fill: false, backgroundColor: chartColors[1]};
    datasets.push(popDataset);
    let labels = report.data.map(data => data.label);

    switch (report.view) {
      // internet or no internet
      case 'internet':
        this.chartPopCustomTitle = 'Avg Grade by Internet Access';
        break;

      // number of class failures
      case 'failures':
      this.chartPopCustomTitle = 'Avg Grade by # of Class Failures';
        break;

      // hours per week spent studying
      case 'studytime':
      this.chartPopCustomTitle = 'Avg Grade by Weekly Study Time';
        break;

      // absences from class
      case 'absences':
      this.chartPopCustomTitle = 'Avg Grade by Class Absences';
        break;

      // home to school travel time
      case 'traveltime':
      this.chartPopCustomTitle = 'Avg Grade by Travel Time';
        break;

      // current health status
      case 'health':
      this.chartPopCustomTitle = 'Avg Grade by Health';
        break;
    }

    // if chart was previously generated...destroy and create a new
    if (this.chartPopCustom.id) this.chartPopCustom.destroy();

    // build chart
    this.chartPopCustom = new Chart('chartPopCustom', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true, 
        maintainAspectRatio: false,
        title: {text: this.chartPopCustomTitle, display: true},
        scales: {yAxes: [{ticks: {min: 5, stepSize: .5}}]}
      }
    });

    this.chartPopCustomLoading = false;
  }
}

