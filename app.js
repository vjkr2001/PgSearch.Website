const express = require('express');
const mysql = require("mysql")
const path = require("path")
const dotenv = require('dotenv')
const bcrypt = require("bcryptjs")

dotenv.config({ path: './.env'})

const app = express();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

//This directory is often used to serve static files such as images, stylesheets, and JavaScript files.
const publicDir = path.join(__dirname, './public')

// we can access the files in public directory directly via their URLs. 
app.use(express.static(publicDir))
app.use(express.urlencoded({extended: 'false'}))
//It parses the JSON data and makes it available on the req.body object of the route handlers. 
app.use(express.json())

// It will look for hbs files in the directorys
app.set('view engine', 'hbs')

db.connect((error) => {
    if(error) {
        console.log(error)
    } else {
        console.log("MySQL connected!")
    }
})


app.get("/", (req, res) => {
    res.render("index")
})

app.get("/register", (req, res) => {
    res.render("register")
})

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
// Checks the data with the databse if it is not there it will add to the databse.
app.post("/register", (req, res) => {    
    const { name, email, password, password_confirm } = req.body

    // Check if any field is empty
    if (!name || !email || !password || !password_confirm) {
        return res.render('register', {
            message: 'Please fill in all the details'
        })
    }
    // Check if email is in valid format
    if (!email.match(emailRegex)) {
        return res.render('register', {
            message: 'Invalid email format'
        })
    }
    
    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, result) => {
        if(error){
            console.log(error)
        }

        if( result.length > 0 ) {
            return res.render('register', {
                message: 'This email is already in use'
            })
        } else if(password !== password_confirm) {
            return res.render('register', {
                message: 'Password Didn\'t Match!'
            })
        }

        let hashedPassword = await bcrypt.hash(password, 8)

        console.log(hashedPassword)
       
        db.query('INSERT INTO users SET?', {name: name, email: email, password: hashedPassword}, (err, result) => {
            if(error) {
                console.log(error)
            } else {
                return res.render('register', {
                    message: 'User registered!'
                });
                res.redirect('/');
            }
        })        
    })
})

app.listen(5000, ()=> {
    console.log("server started on port 5000")
})
