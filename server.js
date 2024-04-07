/*********************************************************************************
  * WEB700 – Assignment 06
  * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part of this
  * assignment has been copied manually or electronically from any other source (including web sites) or
  *distributed to other students.
  * Name: __________Dikshit Aryal____________ Student ID: ___122660236___________ Date: ____2024-04-06____________
  * Online (Cyclic) Link: ________________________________________________________
  * ********************************************************************************/
const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const data = require("./modules/collegeData.js");

const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.engine('.hbs', exphbs.engine({ 
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }        
    }
}));

app.set('view engine', '.hbs');

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));    
    next();
});


app.get("/", (req,res) => {
    res.render("home");
});

app.get("/about", (req,res) => {
    res.render("about");
});

app.get("/htmlDemo", (req,res) => {
    res.render("htmlDemo");
});

app.get("/students", (req, res) => {
    if (req.query.course) {
        data.getStudentsByCourse(req.query.course).then((data) => {
            res.render("students", {students: data});
        }).catch((err) => {
            res.render("students", {message: "no results"});
        });
    } else {
        data.getAllStudents().then((data) => {
            res.render("students", {students: data});
        }).catch((err) => {
            res.render("students", {message: "no results"});
        });
    }
});

app.get("/students/add", (req,res) => {
    res.render("addStudent");
});


app.post("/students/add", (req, res) => {
    data.addStudent(req.body).then(()=>{
      res.redirect("/students");
    });
  });

app.get("/student/:studentNum", (req, res) => {
    data.getStudentByNum(req.params.studentNum).then((data) => {
        res.render("student", { student: data }); 
    }).catch((err) => {
        res.render("student", {message: "no results"})
    });
});

app.post("/student/update", (req, res) => {
    data.updateStudent(req.body).then(() => {
        res.redirect("/students");
    });
});

app.get("/courses", (req,res) => {
    data.getCourses().then((data)=>{
        res.render("courses", {courses: data});
    }).catch(err=>{
        res.render("courses", {message: "no results"});
    });
});

app.get("/course/:id", (req, res) => {
    data.getCourseById(req.params.id).then((data) => {
        res.render("course", { course: data }); 
    }).catch((err) => {
        res.render("course",{message:"no results"}); 
    });
});

app.use((req,res)=>{
    res.status(404).send("Page Not Found");
});


data.initialize().then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});

app.get('/students', (req, res) => {
    collegeData.getAllStudents()
        .then(students => {
            if (students.length > 0) {
                res.render("students", { students: students });
            } else {
                res.render("students", { message: "No results" });
            }
        })
        .catch(err => {
            res.render("students", { message: "Error fetching students" });
        });
});

app.get('/courses', (req, res) => {
    collegeData.getCourses()
        .then(courses => {
            if (courses.length > 0) {
                res.render("courses", { courses: courses });
            } else {
                res.render("courses", { message: "No results" });
            }
        })
        .catch(err => {
            res.render("courses", { message: "Error fetching courses" });
        });
});
app.get("/student/:studentNum", (req, res) => {
    let viewData = {};

    collegeData.getStudentByNum(req.params.studentNum)
        .then(student => {
            viewData.student = student || null;
        })
        .catch(() => {
            viewData.student = null;
        })
        .then(collegeData.getCourses)
        .then(courses => {
            viewData.courses = courses;
            if (viewData.student) {
                for (let i = 0; i < viewData.courses.length; i++) {
                    if (viewData.courses[i].courseId == viewData.student.course) {
                        viewData.courses[i].selected = true;
                    }
                }
            }
        })
        .catch(() => {
            viewData.courses = [];
        })
        .then(() => {
            if (!viewData.student) {
                res.status(404).send("Student Not Found");
            } else {
                res.render("student", { viewData: viewData });
            }
        });
});
