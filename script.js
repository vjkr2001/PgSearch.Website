const express = require('express');
const mysql = require("mysql");
const path = require("path");
const dotenv = require('dotenv');
const bcrypt = require("bcryptjs");
const session = require("express-session");

dotenv.config({ path: './.env' });

const app = express();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

const publicDir = path.join(__dirname, './public');
app.use(express.static(publicDir));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('view engine', 'hbs');

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

db.connect((error) => {
    if (error) {
        console.log(error);
    } else {
        console.log("MySQL connected!");
    }
});

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/about", (req, res) => {
    res.render("aboutus");
});

// ... Existing code ...

app.get("/search", (req, res) => {
    const { location, roomType, city } = req.query;
  
    let sql = "SELECT p.pgname, p.locality, p.share_option, o.ownername, o.contactnumber, p.price FROM pgs p INNER JOIN owners o ON p.pgid = o.pgid WHERE p.locality = ?";
  
    const queryParams = [location];
  
    if (roomType !== "Room type") {
      sql += " AND p.share_option = ?";
      queryParams.push(roomType);
    }
  
    db.query(sql, queryParams, (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: "An error occurred while fetching data." });
      }
      console.log(results)
      res.status(200).json(results);
    });
  });
  
  // ... Rest of your code ...
  

app.post("/register", async (req, res) => {
    const { name, email, password, password_confirm } = req.body;

    if (!name || !email || !password || !password_confirm) {
        return res.render('register', {
            message: 'Please fill in all the details'
        });
    }

    if (!email.match(emailRegex)) {
        return res.render('register', {
            message: 'Invalid email format'
        });
    }

    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, result) => {
        if (error) {
            console.log(error);
        }

        if (result.length > 0) {
            return res.render('register', {
                message: 'This email is already in use'
            });
        } else if (password !== password_confirm) {
            return res.render('register', {
                message: 'Password Didn\'t Match!'
            });
        }

        let hashedPassword = await bcrypt.hash(password, 8);

        db.query('INSERT INTO users SET?', { name: name, email: email, password: hashedPassword }, (err, result) => {
            if (error) {
                console.log(error);
                return res.render('register', {
                    message: 'An error occurred during registration.'
                });
            }

            console.log("User registered!");

            res.redirect('/login');
        });
    });
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('login', {
            message: 'Please enter both email and password'
        });
    }
    if (!email.match(emailRegex)) {
        return res.render('login', {
            message: 'Invalid email format'
        });
    }
    db.query('SELECT * FROM users WHERE email = ?', [email], async (error, result) => {
        if (error) {
            console.log(error);
        }

        if (result.length === 0 || !(await bcrypt.compare(password, result[0].password))) {
            return res.render('login', {
                message: 'Invalid email or password'
            });
        } else {
            req.session.loggedIn = true;
            req.session.user = result[0];
            res.redirect('/home');
        }
    });
});


app.get("/home", (req, res) => {
    if (req.session.loggedIn) {
        res.render("home", { user: req.session.user });
    } else {
        res.redirect('/login');
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.log(error);
        }
        res.redirect('/login');
    });
});

app.listen(5000, () => {
    console.log("server started on port 5000");
});

