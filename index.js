import express from 'express'
import bodyParser from 'body-parser'
import hbs from 'hbs'
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'

import { readPosts, readUser, insertUser, insertPost, likeFun, shareFun, deleteFun } from './operations.js'


const app = express()


mongoose.connect("mongodb://127.0.0.1:27017/cinema",{
    useNewUrlParser:true,
    useUnifiedTopology:true
})

const screen1Model = mongoose.model('screen1',{
    seatno:{type:Number},
    status:{type:String}
})

const screen2Model = mongoose.model('screen2',{
    seatno:{type:Number},
    status:{type:String}
})

const screen3Model = mongoose.model('screen3',{
    seatno:{type:Number},
    status:{type:String}
})

const moviesModel = mongoose.model('movies',{
    name:{type:String},
    rate:{type:Number},
    screenNo:{type:Number}
})
var screen1Res
screen1Model.find()
.then(function(output){
    screen1Res = output
})
.catch(function(err){
    console.log(err)
})

var screen2Res
screen2Model.find()
.then(function(output){
    screen2Res = output
})
.catch(function(err){
    console.log(err)
})

var screen3Res
screen3Model.find()
.then(function(output){
    screen3Res = output
})
.catch(function(err){
    console.log(err)
})

var moviesRes
moviesModel.find()
.then(function(output){
    moviesRes = output
})
.catch(function(err){
    console.log(err)
})


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(cookieParser())
app.use(express.static(path.join(__dirname,"public")))

app.set('view engine', 'hbs')

app.get('/', (req, res) => {
    res.render("login")
})

app.get('/cinema',(req,res)=>{
    res.render("cinema",{
       movies:moviesRes,
       screen1:screen1Res,
       screen2:screen2Res,
       screen3:screen3Res
        
    })
})

app.post('/login', async (req, res) => {
    // console.log(req.body.profile)
    // console.log(req.body.password)
    const output = await readUser(req.body.profile)
    const password = output[0].password
    if(password === req.body.password){

         const payload = {"profile":output[0].profile, "name":output[0].name, "headline":output[0].headline}
         const secret ="af8c5011c31386d02760b5a86bb1151b18345b68e87873617a65cc5a786b179098989a51ed633290d0570a0076762ececaaaca54e553f4ba5ee6f34ef4398681"

         const token = jwt.sign(payload,secret)
         res.cookie("token",token)
         res.redirect("/posts")
     }
     else{
         res.send("Incorrect Username or Password")
     }
     console.log(output)
})

app.get('/posts',verifyLogin,async(req,res)=>{
    const output = await readPosts()
    res.render("posts",{
        data:output,
        userInfo:req.payload
    })
})

app.post('/likes',async(req,res)=>{
    await likeFun(req.body.content)
    res.redirect('/posts')
})
app.post('/shares',async(req,res)=>{
    await shareFun(req.body.content)
    res.redirect('/posts')
})

app.post('/delete',async(req,res)=>{
    await deleteFun(req.body.content)
    res.redirect('/posts')
})

app.post('/addposts',async(req,res)=>{
    await insertPost(req.body.profile,req.body.content)
    res.redirect('/posts')
})

function verifyLogin(req,res,next){
    const secret ="af8c5011c31386d02760b5a86bb1151b18345b68e87873617a65cc5a786b179098989a51ed633290d0570a0076762ececaaaca54e553f4ba5ee6f34ef4398681"
    const token = req.cookies.token
    jwt.verify(token,secret,(err,payload)=>{
        if(err) return res.sendStatus(403)
        req.payload = payload
    })
    next()
}

app.post('/addusers',async(req,res)=>{
    if(req.body.password === req.body.cnfpassword){

        await insertUser(req.body.name, req.body.profile, req.body.password, req.body.headline)
        res.redirect('/')
    }
    else{
        res.send("password and Confirm password did not match")
    }
    
})

app.get('/signup',(req,res)=>{
    res.render("signup")
})

app.listen(3000, () => {

    console.log("Listening...")
})