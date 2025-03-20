const express = require("express")
const app = express();

const router = require("router")
const cookieParser = require("cookie-parser")
const path = require("path")

const logoutRouter = require("./routes/logout")

const homeRouter = require("./routes/index")
const studentRouter = require("./routes/student-register")
const studentLoginRouter = require("./routes/student-login")
const instituteRouter = require("./routes/institute-register")
const instituteLoginRouter = require("./routes/institute-login")
const facultyRouter = require("./routes/faculty-register")
const facultyLoginRouter = require("./routes/faculty-login")
const hodLoginRouter = require("./routes/hod-login")
const instituteDashboardRouter = require("./routes/institute-dashboard")
const hodDashboardRouter = require("./routes/hod-dashboard")

const addYearRouter = require("./routes/add-year")
const addDepartmentRouter = require("./routes/add-dept")
const addDivisionRouter = require("./routes/add-division")

const viewYearRouter = require("./routes/view-year")
const viewDivisionRouter = require("./routes/view-division")

const viewStudentRouter = require("./routes/view-students")

const approveFacultyRouter = require("./routes/hod-dashboard")

const classTeacherRouter = require("./routes/class-teacher")
const approveStudentRouter = require("./routes/class-teacher")



const db = require("./config/mongoose-connection")

app.set('view engine', 'ejs')
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended : true}))
app.use(express.static(path.join(__dirname, "public")))

app.use("/logout", logoutRouter)

app.use("/", homeRouter)
app.use("/student-register", studentRouter)
app.use("/student-login", studentLoginRouter)
app.use("/institute-register", instituteRouter)
app.use("/institute-login", instituteLoginRouter)
app.use("/faculty-register", facultyRouter)
app.use("/faculty-login", facultyLoginRouter)
app.use("/hod-login", hodLoginRouter)
app.use("/institute-dashboard", instituteDashboardRouter)
app.use("/hod-dashboard", hodDashboardRouter)

app.use("/", viewYearRouter)
app.use("/", viewDivisionRouter)

app.use("/", addDivisionRouter)
app.use("/", addYearRouter)
app.use("/add-department", addDepartmentRouter)

app.use("/", approveFacultyRouter)

app.use("/", viewStudentRouter)

app.use("/classteacher", classTeacherRouter)
app.use("/", classTeacherRouter)

app.listen(3000)