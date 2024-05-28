require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var usersRouter = require("./routes/users");
var donationRouter = require("./routes/donations");
var benefactorRouter = require("./routes/benefactors");
var dashboardRouter = require("./routes/dashboard");
var homeRouter = require("./routes/home");
var authRouter = require("./routes/auth");
var mongoose = require("mongoose");
var app = express();
var swaggerUI = require("swagger-ui-express");
var cors = require('cors')

app.use(cors({
	origin: 'http://localhost:4200',
	credentials: true
}));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use("/uploads", express.static("./uploads"));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(require("./swagger")));

app.use("/users", usersRouter);
app.use("/donations", donationRouter);
app.use("/benefactors", benefactorRouter);
app.use("/dashboard", dashboardRouter);
app.use("/home", homeRouter);
app.use("/auth", authRouter);

app.use((req, res, next) => {
	if (req.originalUrl === "/") {
		res.redirect("/auth/login");
	} else {
		next();
	}
});

app.use((req, res, next) => {
	next(createError(404));
});

mongoose
	.connect(process.env.MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log("MongoDB Connected successfully.");
	})
	.catch((error) => {
		console.error("Error connecting to MongoDB:", error);
	});

app.use((err, req, res, next) => {
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
