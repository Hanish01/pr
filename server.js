const express=require('express');
const app=express();
const { pool }=require('./dbConfig');
const bcrypt =require('bcrypt');
const session=require('express-session');
const flash = require('express-flash');
const passport =require('passport');

const initializepassport =require("./passportConfig");


initializepassport(passport);


app.set("view engine","ejs");

app.use(express.urlencoded({extended: false}));
app.use(session({
    secret: 'secret',//for encryption
    resave: false, //if nothing is changed should we chasnge our session variables??
    saveUninitialized: false //do we need to save if no val in the session

}));

app.use(passport.initialize());
app.use(passport.session());
app.use( express.static( "views" ) );

app.use(flash());
app.get('/',(req,res)=>
{
    res.render('index');
});

app.get('/users/register',checkingAuth,(req,res)=>
{
    res.render("register");
});
app.get('/users/login',checkingAuth,(req,res)=>
{
    res.render("login");
});

app.get('/users/home',checkingnotAuth,(req,res)=>
{
    res.render('homepage',{user : req.user.name});
});

app.get('/users/1',(req,res)=>
{

    if (req.isAuthenticated()) {
        res.render('1', { user: req.user.name });
    } else {
        res.redirect('/users/login');
    }
});

app.get('/users/2',(req,res)=>
{
    if (req.isAuthenticated()) {
        res.render('2', { user: req.user.name });
    } else {
        res.redirect('/users/login');
    }
});

app.get('/users/3',(req,res)=>
{
    if (req.isAuthenticated()) {
        res.render('3', { user: req.user.name });
    } else {
        res.redirect('/users/login');
    }
});

app.get('/users/4',(req,res)=>
{
    if (req.isAuthenticated()) {
        res.render('4', { user: req.user.name });
    } else {
        res.redirect('/users/login');
    }
});

app.get('/users/5',(req,res)=>
{
    if (req.isAuthenticated()) {
        res.render('5', { user: req.user.name });
    } else {
        res.redirect('/users/login');
    }
});

app.get('/users/6',(req,res)=>
{
    if (req.isAuthenticated()) {
        res.render('6', { user: req.user.name });
    } else {
        res.redirect('/users/login');
    }
});

app.get('/users/7',(req,res)=>
{
    if (req.isAuthenticated()) {
        res.render('7', { user: req.user.name });
    } else {
        res.redirect('/users/login');
    }
});



app.get("/users/logout", (req, res) => {
    req.logout((err)=>{
        if(err)
        {
            throw err;
        }
    });
  
    res.redirect('/');
  });


  


app.post('/users/register', async (req,res)=>
{
    let { name,email,password,password2 }=req.body;

    console.log({
        name,email,password,password2
    });
    let errors=[];

    if(!name ||!email ||!password ||!password2)
    {
        errors.push({message: "Please enter all the fields"});
    }

    if(password.length<6)
    {
        errors.push({message: "Password should be atleast 6 char"});
    }

    if(password!=password2)
    {
        errors.push({message:"Both the passwords should be same"});
    }

    if(errors.length>0)
    {
        res.render('register',{errors}); //passing the errors into the page again
    }

    //all done

    else{
        let hashpassword= await bcrypt.hash(password,10);
        console.log(hashpassword);


        pool.query(
            `select * from projects
            where email = $1`,[email], (err, results)=>{ //calback fun
                    if(err)
                    {
                        throw err;
                    }
                    

                    console.log(results.rows);

                    if(results.rows.length>0)
                    {
                        errors.push({message: "email already registred"});
                        res.render('register',{errors});
                    }
                    else{
                        //not there in our database
                        pool.query(
                            `insert into projects (name,email,password)
                            values ($1,$2,$3)
                            Returning id,password`,[name,email,hashpassword],
                            (err,results)=>
                            {
                                if(err)
                                {
                                    throw err;
                                }
                                console.log(results.rows);
                                req.flash('success',"You have been registered.Now you can login");
                                res.redirect('/users/login');
                            }
                        )
                    }
            }
        )
    }
});


app.post('/users/login',passport.authenticate('local',{
    successRedirect: '/users/home'
    ,failureRedirect: '/users/login'
    ,failureFlash: true
}));



function checkingAuth(req,res,next)
{
    if(req.isAuthenticated())
    {
        return res.redirect('/users/home');
    }
    next();
}

function checkingnotAuth(req,res,next)
{
    if(req.isAuthenticated())
    {
        return next();
    }
    res.redirect('/users/login');
}

app.listen(4000);