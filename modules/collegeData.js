const Sequelize = require('sequelize');
var sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'sDg32Sd2dc', {
    host: 'sdec-sdtr-63433.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query:{ raw: true }
});
const fs = require("fs");

class Data{
    constructor(students, courses){
        this.students = students;
        this.courses = courses;
    }
}

let dataCollection = null;

module.exports.initialize = function () {
    return new Promise( (resolve, reject) => {
        fs.readFile('./data/courses.json','utf8', (err, courseData) => {
            if (err) {
                reject("unable to load courses"); return;
            }

            fs.readFile('./data/students.json','utf8', (err, studentData) => {
                if (err) {
                    reject("unable to load students"); return;
                }

                dataCollection = new Data(JSON.parse(studentData), JSON.parse(courseData));
                resolve();
            });
        });
    });
}

module.exports.getAllStudents = function(){
    return new Promise((resolve,reject)=>{
        if (dataCollection.students.length == 0) {
            reject("query returned 0 results"); return;
        }

        resolve(dataCollection.students);
    })
}

module.exports.getCourses = function(){
   return new Promise((resolve,reject)=>{
    if (dataCollection.courses.length == 0) {
        reject("query returned 0 results"); return;
    }

    resolve(dataCollection.courses);
   });
};

module.exports.getStudentByNum = function (num) {
    return new Promise(function (resolve, reject) {
        var foundStudent = null;

        for (let i = 0; i < dataCollection.students.length; i++) {
            if (dataCollection.students[i].studentNum == num) {
                foundStudent = dataCollection.students[i];
            }
        }

        if (!foundStudent) {
            reject("query returned 0 results"); return;
        }

        resolve(foundStudent);
    });
};

module.exports.getStudentsByCourse = function (course) {
    return new Promise(function (resolve, reject) {
        var filteredStudents = [];

        for (let i = 0; i < dataCollection.students.length; i++) {
            if (dataCollection.students[i].course == course) {
                filteredStudents.push(dataCollection.students[i]);
            }
        }

        if (filteredStudents.length == 0) {
            reject("query returned 0 results"); return;
        }

        resolve(filteredStudents);
    });
};

module.exports.getCourseById = function (id) {
    return new Promise(function (resolve, reject) {
        var foundCourse = null;

        for (let i = 0; i < dataCollection.courses.length; i++) {
            if (dataCollection.courses[i].courseId == id) {
                foundCourse = dataCollection.courses[i];
            }
        }

        if (!foundCourse) {
            reject("query returned 0 results"); return;
        }

        resolve(foundCourse);
    });
};

module.exports.addStudent = function (studentData) {
    return new Promise(function (resolve, reject) {

        studentData.TA = (studentData.TA) ? true : false;
        studentData.studentNum = dataCollection.students.length + 1;
        dataCollection.students.push(studentData);

        resolve();
    });

};

module.exports.updateStudent = function (studentData) {
    return new Promise(function (resolve, reject) {

        studentData.TA = (studentData.TA) ? true : false;

        for(let i=0; i < dataCollection.students.length; i++){
            if(dataCollection.students[i].studentNum == studentData.studentNum){
                dataCollection.students[i] = studentData;
            }
        }
        resolve();
    });
};


const { Sequelize, Student, Course } = require('./models');

function initialize() {
    return new Promise((resolve, reject) => {
        Sequelize.sync()
            .then(() => {
                console.log('Database synced successfully');
                resolve();
            })
            .catch(err => {
                console.error('Unable to sync the database:', err);
                reject('Unable to sync the database');
            });
    });
}

module.exports = { initialize };

const { Student } = require('./models');

function getAllStudents() {
    return new Promise((resolve, reject) => {
        Student.findAll()
            .then(students => {
                if (students && students.length > 0) {
                    resolve(students);
                } else {
                    reject('No students found');
                }
            })
            .catch(err => {
                console.error('Error fetching students:', err);
                reject('No results returned');
            });
    });
}

module.exports = { getAllStudents };
const { Student, Course } = require('./models');

function getStudentByNum(num) {
    return new Promise((resolve, reject) => {
        Student.findAll({ where: { studentNum: num } })
            .then(students => {
                if (students && students.length > 0) {
                    resolve(students[0]);
                } else {
                    reject('No student found with the provided student number');
                }
            })
            .catch(err => {
                console.error('Error fetching student by number:', err);
                reject('No results returned');
            });
    });
}

function getCourses() {
    return new Promise((resolve, reject) => {
        Course.findAll()
            .then(courses => {
                if (courses && courses.length > 0) {
                    resolve(courses);
                } else {
                    reject('No courses found');
                }
            })
            .catch(err => {
                console.error('Error fetching courses:', err);
                reject('No results returned');
            });
    });
}

function getCourseById(id) {
    return new Promise((resolve, reject) => {
        Course.findAll({ where: { id: id } })
            .then(courses => {
                if (courses && courses.length > 0) {
                    resolve(courses[0]);
                } else {
                    reject('No course found with the provided ID');
                }
            })
            .catch(err => {
                console.error('Error fetching course by ID:', err);
                reject('No results returned');
            });
    });
}

function addStudent(studentData) {
    studentData.TA = (studentData.TA) ? true : false;
    for (const key in studentData) {
        if (studentData.hasOwnProperty(key) && studentData[key] === "") {
            studentData[key] = null;
        }
    }
    return new Promise((resolve, reject) => {
        Student.create(studentData)
            .then(() => {
                resolve();
            })
            .catch(err => {
                console.error('Error creating student:', err);
                reject('Unable to create student');
            });
    });
}

function updateStudent(studentData) {
    studentData.TA = (studentData.TA) ? true : false;
    for (const key in studentData) {
        if (studentData.hasOwnProperty(key) && studentData[key] === "") {
            studentData[key] = null;
        }
    }
    return new Promise((resolve, reject) => {
        Student.update(studentData, { where: { studentNum: studentData.studentNum } })
            .then(() => {
                resolve();
            })
            .catch(err => {
                console.error('Error updating student:', err);
                reject('Unable to update student');
            });
    });
}

module.exports = { getStudentByNum, getCourses, getCourseById, addStudent, updateStudent };
const { Course } = require('./models');

function updateCourse(courseData) {
    for (const key in courseData) {
        if (courseData.hasOwnProperty(key) && courseData[key] === "") {
            courseData[key] = null;
        }
    }
    return new Promise((resolve, reject) => {
        Course.update(courseData, { where: { courseId: courseData.courseId } })
            .then(() => {
                resolve();
            })
            .catch(err => {
                console.error('Error updating course:', err);
                reject('Unable to update course');
            });
    });
}

module.exports = { updateCourse };

const { Course } = require('./models');

function addCourse(courseData) {
    for (const key in courseData) {
        if (courseData.hasOwnProperty(key) && courseData[key] === "") {
            courseData[key] = null;
        }
    }
    return new Promise((resolve, reject) => {
        Course.create(courseData)
            .then(() => {
                resolve();
            })
            .catch(err => {
                console.error('Error creating course:', err);
                reject('Unable to create course');
            });
    });
}

function updateCourse(courseData) {
    for (const key in courseData) {
        if (courseData.hasOwnProperty(key) && courseData[key] === "") {
            courseData[key] = null;
        }
    }
    return new Promise((resolve, reject) => {
        Course.update(courseData, { where: { courseId: courseData.courseId } })
            .then(() => {
                resolve();
            })
            .catch(err => {
                console.error('Error updating course:', err);
                reject('Unable to update course');
            });
    });
}

function deleteCourseById(id) {
    return new Promise((resolve, reject) => {
        Course.destroy({ where: { courseId: id } })
            .then(() => {
                resolve();
            })
            .catch(err => {
                console.error('Error deleting course:', err);
                reject('Unable to delete course');
            });
    });
}

module.exports = { addCourse, updateCourse, deleteCourseById };


