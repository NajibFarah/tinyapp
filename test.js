const express = require("express");
const app = express();
const PORT = 8080;
const users = { 
    "userRandomID": {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    },
   "user2RandomID": {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: "dishwasher-funk"
    }
  }

app.set("view engine", "ejs");

const getUsersByEmail = function(email) {
  for (const id in users) {
    const user = users[id];
    if(user.email === email) {
      return user;
    }
  }
  return null;
};

const generateRandomString = function() {
    return Math.random().toString(36).substr(2, 6);
};

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  };
  
  const bodyParser = require("body-parser");
  app.use(bodyParser.urlencoded({extended: true}));
  
  const cookieParser = require("cookie-parser");
  app.use(cookieParser())
  
  app.get("/", (req, res) => {
    res.send("Hello!");
  });
  
  
  app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });
  
  app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });
  
  app.get("/urls", (req, res) => {
    const templateVars = {username: req.cookies["user_ID"],
     urls: urlDatabase };
    res.render("urls_index", templateVars);
  });
  
  app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL]
    res.redirect(longURL);
  });
  
  app.get("/register", (req, res) => {

    const templateVars = { username: req.cookies['user_ID'] };
    res.render("register", templateVars);
  }); 

  app.post("/register", function(req, res) {
    let email = req.body.email;
    let password = req.body.password;
    if (!email || email === "" && !password || password === ""){
      res.sendStatus(404)
    } else {
      let match = false 
      for (let i in users){
        if (users[i].email === email && users[i].password === password){
          match = true
        }
      }
      if (!match) {
        res.sendStatus(400)
      }
      let id = generateRandomString()
      console.log(`${email} ${password}`)
      console.log(match)
      users[id] = {
      id: id,
      email: email,
      password: password
    };
  
      res.cookie("user_id", id);
      res.redirect("/urls");
  }
  });
  
  app.post("/urls", (req, res) => {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect(`urls/${shortURL}`);
  });
  
  app.get("/urls/new", (req, res) => {
    const templateVars = {username: req.cookies["user_ID"],}
    res.render("urls_new", templateVars);
  });
  
  app.get("/urls/:shortURL", (req, res) => {
    const long = urlDatabase[req.params.shortURL];
    const templateVars = { shortURL: req.params.shortURL, longURL: long, username: req.cookies["user_ID"]} ;
    res.render("urls_show", templateVars);
  });
    
  app.post("/urls/:shortURL", (req, res) => {
    let shortURL = req.params.shortURL;
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect("/urls");
  }); 
  
  
  app.post("/urls/:shortURL/delete", (req, res) => {
    let shortURL = req.params.shortURL;
    delete urlDatabase[shortURL]
    res.redirect("/urls");
  });
  
  app.post("/urls/:shortURL/edit", ( req, res) => {
      res.send("ok")
  })

  
  // app.post("/login", (req, res) => {
  //   const username = req.body.username
  //   console.log(username)
  //   res.cookie("username", username)
  //   res.redirect("/urls")
  // })

  app.post("/logout", (req, res) => {
    const username = req.body.username
    console.log(username)
    res.clearCookie("user_ID", username)
    res.redirect("/urls")
  })

  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });
  


  // sdvnsjdknvsjkgvjkdbnkdgv








  <!DOCTYPE html>
<html>
  <style>
    body {
      background-image: url("Macphoto.jpg");
    }
    * {
      box-sizing: border-box;
    }

    /* Add padding to containers */
    .container {
      padding: 16px;
    }

    /* Full-width input fields */
    input[type="text"],
    input[type="password"] {
      width: 100%;
      padding: 15px;
      margin: 5px 0 22px 0;
      display: inline-block;
      border: none;
      background: #f1f1f1;
    }

    input[type="text"]:focus,
    input[type="password"]:focus {
      background-color: #ddd;
      outline: none;
    }

    /* Overwrite default styles of hr */
    hr {
      border: 1px solid #f1f1f1;
      margin-bottom: 25px;
    }

    /* Set a style for the submit/register button */
    .registerbtn {
      background-color: #04aa6d;
      color: white;
      padding: 16px 20px;
      margin: 8px 0;
      border: none;
      cursor: pointer;
      width: 100%;
      opacity: 0.9;
    }

    .registerbtn:hover {
      opacity: 1;
    }

    /* Add a blue text color to links */
    a {
      color: dodgerblue;
    }

    /* Set a grey background color and center the text of the "sign in" section */
    .signin {
      background-color: #f1f1f1;
      text-align: center;
    }
  </style>
  <form action="/register" method="POST">
    <div class="container">
      <h1>Register</h1>
      <hr />

      <label for="email"><b>Email</b></label>
      <input
        type="text"
        placeholder="Enter Email"
        name="email"
        id="email"
        required
      />

      <label for="psw"><b>Password</b></label>
      <input type="password" placeholder="Enter Password" name="psw" required />

      <button type="submit" class="registerbtn"<a href="http://localhost:8080/urls/">Register</a>
    </div>
  </form>
</html>