const dbPool = require('../../../data/redshift')('bueller');

// define models
class GradeStat{
  constructor(label, avgGrade, sampleSize, subSampleSize){
    this.label = label;
    this.avgGrade = avgGrade;
    this.sampleSize = (typeof sampleSize === 'undefined') ? 0 : sampleSize;
    this.subSampleSize = (typeof subSampleSize === 'undefined') ? 0 : subSampleSize;
  }
}


const redshift = {

  // get report stats
  async getReportStats(req, res) {
    let reportStats = {
      studentCount: 0, 
      femaleCount: 0, 
      maleCount: 0, 
      minAge: 0, 
      maxAge: 0,
      g1Avg: 0,
      g2Avg: 0,
      g3Avg: 0,
      schoolStats: [],
      binaryStats: []
    };
    
    // init query obj and run
    let query = {
      text: "SELECT * FROM gmt_bueller.gmt_bueller ",
      values: []
    }

    try {
      var result = await dbPool.query(query);
    } catch(error) {
      return res.status(500).send(error);
    }

    let studentData = result.rows;

    // if results, continue
    if (studentData.length) {
      reportStats.studentCount = studentData.length;
      reportStats.maleCount = studentData.filter(data => data.sex === 'M').length;
      reportStats.femaleCount = studentData.filter(data => data.sex === 'F').length;
      reportStats.minAge = Math.min(...studentData.map(data => parseInt(data.age)));
      reportStats.maxAge = Math.max(...studentData.map(data => parseInt(data.age)));
      reportStats.g1Avg = Math.round(studentData
          .map(data => parseInt(data.g1))
          .reduce((total, grade) => total + grade, 0) / studentData.length * 10) / 10;
      reportStats.g2Avg = Math.round(studentData
        .map(data => parseInt(data.g2))
        .reduce((total, grade) => total + grade, 0) / studentData.length * 10) / 10;
      reportStats.g3Avg = Math.round(studentData
        .map(data => parseInt(data.g3))
        .reduce((total, grade) => total + grade, 0) / studentData.length * 10) / 10;

      let schools = [] = studentData
        .map(data => data.school)
        .filter((value, index, self) => self.indexOf(value) === index)
        .map(schoolId => {
          if (schoolId === 'GP') return {id: schoolId, name: 'Gabriel Pereira'};
          else if (schoolId === 'MS') return {id: schoolId, name: 'Mousinho da Silveira'};
          else return {id: schoolId, name: 'Unknown'};
        });
      
      for (let i = 0; i < schools.length; i++) {
        let schoolStat = {
          id: schools[i].id,
          name: schools[i].name,
          studentCount: 0,
          maleCount: 0,
          femaleCount: 0,
          minAge: 0,
          maxAge: 0,
          g1Avg: 0,
          g2Avg: 0,
          g3Avg: 0
        }

        let schoolStudentData = studentData.filter(data => data.school === schools[i].id);
        schoolStat.studentCount = schoolStudentData.length;
        schoolStat.maleCount = schoolStudentData.filter(data => data.sex === 'M').length;
        schoolStat.femaleCount = schoolStudentData.filter(data => data.sex === 'F').length;
        schoolStat.minAge = Math.min(...schoolStudentData.map(data => parseInt(data.age)));
        schoolStat.maxAge = Math.max(...schoolStudentData.map(data => parseInt(data.age)));
        schoolStat.g1Avg = Math.round(schoolStudentData
          .map(data => parseInt(data.g1))
          .reduce((total, grade) => total + grade, 0) / schoolStudentData.length * 10) / 10;
        schoolStat.g2Avg = Math.round(schoolStudentData
          .map(data => parseInt(data.g2))
          .reduce((total, grade) => total + grade, 0) / schoolStudentData.length * 10) / 10;
        schoolStat.g3Avg = Math.round(schoolStudentData
          .map(data => parseInt(data.g3))
          .reduce((total, grade) => total + grade, 0) / schoolStudentData.length * 10) / 10;

        reportStats.schoolStats.push(schoolStat);
      }
    }

    // process binary stats
    let fieldList = ['famsize', 'pstatus', 'schoolsup', 'famsup', 'paid', 'activities', 'internet', 'romantic'];
    for (let i = 0; i < fieldList.length; i++) {
      let filteredData = [];
      let label = '';

      // determine field and provide correct filter
      switch (fieldList[i]) {
        case 'famsize':
          label = 'Large family';
          filteredData_yes = studentData.filter(data => data.famsize === 'GT3').map(data => parseInt(data.g3));
          filteredData_no = studentData.filter(data => data.famsize === 'LE3').map(data => parseInt(data.g3));
          break;
        case 'pstatus':
          label = 'Parents cohabitate';
          filteredData_yes = studentData.filter(data => data.pstatus === 'T').map(data => parseInt(data.g3));
          filteredData_no = studentData.filter(data => data.pstatus === 'A').map(data => parseInt(data.g3));
          break;
        case 'schoolsup':
          label = 'Extra educational support';
          filteredData_yes = studentData.filter(data => data.schoolsup === 'yes').map(data => parseInt(data.g3));
          filteredData_no = studentData.filter(data => data.schoolsup === 'no').map(data => parseInt(data.g3));
          break;
        case 'famsup':
          label = 'Family educational support';
          filteredData_yes = studentData.filter(data => data.famsup === 'yes').map(data => parseInt(data.g3));
          filteredData_no = studentData.filter(data => data.famsup === 'no').map(data => parseInt(data.g3));
          break;
        case 'paid':
          label = 'Extra paid classes';
          filteredData_yes = studentData.filter(data => data.paid === 'yes').map(data => parseInt(data.g3));
          filteredData_no = studentData.filter(data => data.paid === 'no').map(data => parseInt(data.g3));
          break;
        case 'activities':
          label = 'Extra-curricular activities';
          filteredData_yes = studentData.filter(data => data.activities === 'yes').map(data => parseInt(data.g3));
          filteredData_no = studentData.filter(data => data.activities === 'no').map(data => parseInt(data.g3));
          break;
        case 'internet':
          label = 'Internet access';
          filteredData_yes = studentData.filter(data => data.activities === 'yes').map(data => parseInt(data.g3));
          filteredData_no = studentData.filter(data => data.activities === 'no').map(data => parseInt(data.g3));
          break;
        case 'romantic':
          label = 'In a romantic relationship';
          filteredData_yes = studentData.filter(data => data.romantic === 'yes').map(data => parseInt(data.g3));
          filteredData_no = studentData.filter(data => data.romantic === 'no').map(data => parseInt(data.g3));
          break;
      }

      let binaryStat = {
        label: label,
        field: fieldList[i],
        yes: (filteredData_yes.length) ? Math.round(filteredData_yes.reduce((total, grade) => total + grade, 0) / filteredData_yes.length * 10) / 10 : 0,
        no: (filteredData_no.length) ? Math.round(filteredData_no.reduce((total, grade) => total + grade, 0) / filteredData_no.length * 10) / 10 : 0
      }
      reportStats.binaryStats.push(binaryStat);
    }

    return res.send(reportStats);
  },
  
  // get all student data
  async getAll(req, res) {
    // check for query params
    let qpSchool = (req.query.school === undefined) ? '' : String(req.query.school).toLowerCase();

    // init query obj and run
    let query = {
      text: "SELECT * FROM gmt_bueller.gmt_bueller WHERE 1 = 1 ",
      values: []
    }
    // if school, add to where
    if (String(qpSchool).length) {
      query.values.push(qpSchool);
      query.text += `AND LOWER(school) = $${query.values.length} `;
    }
    // order by grade desc
    query.text += 'ORDER BY g3 DESC '

    try {
      var result = await dbPool.query(query);
    } catch(error) {
      return res.status(500).send(error);
    }

    let studentData = result.rows;

    return res.send(studentData);
  },

  // get student data by school
  async getBySchool(req, res) {
    let qpSchool = (String(req.params.school).length) ? String(req.params.school).toLowerCase() : '';
    let query = {
      text: "SELECT * FROM gmt_bueller.gmt_bueller WHERE LOWER(school) = $1 ORDER BY g3 DESC LIMIT 10",
      values: [qpSchool]
    }

    try {
      var result = await dbPool.query(query);
    } catch(error) {
      return res.status(500).send(error);
    }

    let studentData = result.rows;

    return res.send(studentData);
  },

  // get student grade outcomes
  async getGradesCustomView(req, res) {
    let view = (String(req.params.view).length) ? String(req.params.view).toLowerCase() : '';
    let query = {
      text: "SELECT * FROM gmt_bueller.gmt_bueller",
      values: []
    };

    try {
      var result = await dbPool.query(query);
    } catch(error) {
      return res.status(500).send(error);
    }

    let studentData = result.rows;
    let report = {view: view, data: []};

    // process avgs based on requested view
    switch (view) {
      // view: internet
      case 'internet':
        report.data = prep_internetAvg(studentData);
        break;

      // view: failures
      case 'failures':
        report.data = prep_failuresAvg(studentData);
        break;

      // view: study time
      case 'studytime':
        report.data = prep_studyTimeAvg(studentData);
        break;

      // view: absences
      case 'absences':
        report.data = prep_absencesAvg(studentData);
        break;
      
      // view: health
      case 'health':
        report.data = prep_healthAvg(studentData);
        break;
      
      // view: travel time
      case 'traveltime':
        report.data = prep_travelTimeAvg(studentData);
        break;

      // if no view match, just return overall averages for all final grades
      default:
        let grades = result.rows.map(data => parseInt(data.g3));
        let gradeAvg = (grades.length) ? Math.round(grades.reduce((total, grade) => total + grade, 0) / grades.length * 10) / 10 : 0;
        report.data.push(new GradeStat('All Students', gradeAvg, grades.length, grades.length));
    }

    // return avgs
    return res.status(200).send(report);
  },
}

// calculate internet grade outcome averages
function prep_internetAvg(studentData) {
  let gradeAvgs = [];

  let internetGrades = studentData
    .filter(data => data.internet === 'yes')
    .map(data => parseInt(data.g3));
  let noInternetGrades = studentData
    .filter(data => data.internet === 'no')
    .map(data => parseInt(data.g3));

  let gradeAvg_internet = (internetGrades.length) ? Math.round(internetGrades.reduce((total, grade) => total + grade, 0) / internetGrades.length * 10) / 10 : 0;
  let gradeAvg_noInternet = (noInternetGrades.length) ? Math.round(noInternetGrades.reduce((total, grade) => total + grade, 0) / noInternetGrades.length * 10) / 10 : 0;

  gradeAvgs.push(new GradeStat('Internet', gradeAvg_internet, studentData.length, internetGrades.length));
  gradeAvgs.push(new GradeStat('No Internet', gradeAvg_noInternet, studentData.length, noInternetGrades.length));

  return gradeAvgs;
}

// calculate failure grade outcome averages
function prep_failuresAvg(studentData) {
  let gradeAvgs = [];

  let failuresData = studentData.map(data => {
    data.failures = (1 <= parseInt(data.failures) && parseInt(data.failures) < 3) ? parseInt(data.failures) : 4;
    return data;
  });
  let maxFailures = Math.max.apply(Math, failuresData.map(function(data) { return data.failures; }));
  for (let i = 1; i <= maxFailures; i++) {
    let failuresGrades_byCount = failuresData
      .filter(data => data.failures === i)
      .map(data => parseInt(data.g3));

    let gradeAvg = (failuresGrades_byCount.length) ? Math.round(failuresGrades_byCount.reduce((total, grade) => total + grade, 0) / failuresGrades_byCount.length * 10) / 10 : 0;
    
    gradeAvgs.push(new GradeStat((i === 1) ? '1 failure' : `${i} failures`, gradeAvg, studentData.length, failuresGrades_byCount.length));
  }

  return gradeAvgs;
}

// calculate study time grade outcome averages
function prep_studyTimeAvg(studentData) {
  let gradeAvgs = [];

  for (let i = 1; i <= 4; i++) {
    let label = '';
    if (i === 1) label = '<2 hours';
    else if (i === 2) label = '2-5 hours';
    else if (i === 3) label = '5-10 hours';
    else if (i === 4) label = '>10 hours';

    let studyTimeGrades_byTimeId = studentData
      .filter(data => data.studytime == i)
      .map(data => parseInt(data.g3));

    let gradeAvg = (studyTimeGrades_byTimeId.length) ? Math.round(studyTimeGrades_byTimeId.reduce((total, grade) => total + grade, 0) / studyTimeGrades_byTimeId.length * 10) / 10 : 0;

    gradeAvgs.push(new GradeStat(label, gradeAvg, studentData.length, studyTimeGrades_byTimeId.length));
  }
  return gradeAvgs;
}

// calculate absences grade outcome averages
function prep_absencesAvg(studentData) {
  let gradeAvgs = [];

  // 1 - 3 absences
  let label_1 = '<4 absences';
  let absenceGrades_1 = studentData
    .filter(data => parseInt(data.absences) < 4)
    .map(data => parseInt(data.g3));
  let gradeAvg_1 = (absenceGrades_1.length) ? Math.round(absenceGrades_1.reduce((total, grade) => total + grade, 0) / absenceGrades_1.length * 10) / 10 : 0;
  gradeAvgs.push(new GradeStat(label_1, gradeAvg_1, studentData.length, absenceGrades_1.length));

  // 4 - 9 absences
  let label_2 = '4-9 absences';
  let absenceGrades_2 = studentData
    .filter(data => parseInt(data.absences) > 3 && parseInt(data.absences) < 10)
    .map(data => parseInt(data.g3));
  let gradeAvg_2 = (absenceGrades_2.length) ? Math.round(absenceGrades_2.reduce((total, grade) => total + grade, 0) / absenceGrades_2.length * 10) / 10 : 0;
  gradeAvgs.push(new GradeStat(label_2, gradeAvg_2, studentData.length, absenceGrades_2.length));

  // 10 - 19 absences
  let label_3 = '10-19 absences';
  let absenceGrades_3 = studentData
    .filter(data => parseInt(data.absences) > 9 && parseInt(data.absences) < 20)
    .map(data => parseInt(data.g3));
  let gradeAvg_3 = (absenceGrades_3.length) ? Math.round(absenceGrades_3.reduce((total, grade) => total + grade, 0) / absenceGrades_3.length * 10) / 10 : 0;
  gradeAvgs.push(new GradeStat(label_3, gradeAvg_3, studentData.length, absenceGrades_3.length));

  // 20 + absences
  let label_4 = '>20 absences';
  let absenceGrades_4 = studentData
    .filter(data => parseInt(data.absences) > 19)
    .map(data => parseInt(data.g3));
  let gradeAvg_4 = (absenceGrades_4.length) ? Math.round(absenceGrades_4.reduce((total, grade) => total + grade, 0) / absenceGrades_4.length * 10) / 10 : 0;
  gradeAvgs.push(new GradeStat(label_4, gradeAvg_4, studentData.length, absenceGrades_4.length));

  return gradeAvgs;
}

// calculate health grade outcome averages
function prep_healthAvg(studentData) {
  let gradeAvgs = [];

  for (let i = 1; i <= 5; i++) {
    let label = '';
    if (i === 1) label = 'Very bad';
    else if (i === 2) label = 'Bad';
    else if (i === 3) label = 'Meh';
    else if (i === 4) label = 'Good';
    else if (i === 5) label = 'Very good';

    let healthGrades_byStatus = studentData
      .filter(data => data.health == i)
      .map(data => parseInt(data.g3));

    let gradeAvg = (healthGrades_byStatus.length) ? Math.round(healthGrades_byStatus.reduce((total, grade) => total + grade, 0) / healthGrades_byStatus.length * 10) / 10 : 0;

    gradeAvgs.push(new GradeStat(label, gradeAvg, studentData.length, healthGrades_byStatus.length));
  }
  return gradeAvgs;
}

// calculate travel time grade outcome averages
function prep_travelTimeAvg(studentData) {
  let gradeAvgs = [];

  for (let i = 1; i <= 5; i++) {
    let label = '';
    if (i === 1) label = '<15 mins';
    else if (i === 2) label = '15-30 mins';
    else if (i === 3) label = '30-60 mins';
    else if (i === 4) label = '>60 mins';

    let travelTimeGrades_byStatus = studentData
      .filter(data => data.traveltime == i)
      .map(data => parseInt(data.g3));

    let gradeAvg = (travelTimeGrades_byStatus.length) ? Math.round(travelTimeGrades_byStatus.reduce((total, grade) => total + grade, 0) / travelTimeGrades_byStatus.length * 10) / 10 : 0;

    gradeAvgs.push(new GradeStat(label, gradeAvg, studentData.length, travelTimeGrades_byStatus.length));
  }
  return gradeAvgs;
}


module.exports = redshift;