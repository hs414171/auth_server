require('dotenv').config()
const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { registerValidation , loginValidation } = require('../validation')
const { valid } = require('@hapi/joi')
const verify = require('./verifytoken')
const { request } = require('express')
const transportIt = require('../nodmailer')
let verified = false




router.get('/get-users',verify, async (req,res)=>{
    try{
        const userData =  await User.find()
        res.send(userData)
    }catch(error){
        res.status(500)
    }
})

router.post('/login', async (req, res)=>{
    const {error} = loginValidation(req.body)
    
    if (error) return res.status(400).send(error.details[0].message)

    const user = await User.findOne({username : req.body.username})
    if (!user) return res.status(400).send("Email not found")
    
    const validPass = await bcrypt.compare(req.body.password,user.password)
    if (!validPass) return res.status(400).send("Password not found")
    
    
    if (verified === false) return res.send("email not confirmed")
    else{
        res.send("Login successfull")
        const token = jwt.sign({_id : user._id},process.env.ACCESS_TOKEN_SECRET)
    
        console.log(token)
    }
    
    
    
    

});
    

    
    


router.post('/reg_user', async (req, res)=>{
    const {error} = registerValidation(req.body)
    
    if (error) return res.status(400).send(error.details[0].message)
    


    const username = req.body.username
    const users = await User.find()
    let state = 0

    
    for(var ind in users){
        if(username === users[ind].username){
            res.status(414).json({message: 'this username already exists'})
            state = 1
            break
        }
    }

    
    if(state === 0){
        const user = new User({
            username: req.body.username,
            password: req.body.password,
            mobile: req.body.mobile,
            name: req.body.name,
            email: req.body.email
    })   
        try{
            const newUser = await user.save()
            res.status(201).json({message: 'new user created', user: newUser})
            
            const token2 = jwt.sign({email:req.body.email},process.env.EMAIL_SECRET)
            console.log(token2)
            
            
            const url = `http://localhost:3000/api/user/verification/${token2}`
            const options = {
                from : process.env.EMAIL_ADDRESS,
                to : req.body.email,
                subject : "VERIFY YOUR ACCOUNT",
                html : `
                Click on the given link to verify your account: <a href = "${url}"> ${url}</a>

                `
            }
            transportIt.sendMail(options,function(error,info){
                if (error){
                    console.log(error)
                }
                else{
                    console.log("Email Sent"+info.response)
                }
            })
            
            
        }catch(error){
            res.status(400).json({message: error.message})
        }
    }
    
});

router.patch('/updateInfo',async (req,res)=>{
    const query = {username:req.body.username}
    req.body.password = await bcrypt.hash(req.body.password, 8);
    
    const update_doc = {
        $set:{
            "password" : req.body.password,
            "name" : req.body.name,
            "mobile" : req.body.mobile,
            "email": req.body.email,
            "username": req.body.usernamech
        }
    }
    try{
        const result = await User.findOneAndUpdate(query,update_doc,{useFindAndModify : false , new:true})
        res.status(221).json({message:"Updated Succesfully",doc:result})
    }
    catch(e){
        res.status(421).json({message : error.message})
    }
})
router.get('/verification/:token2',(req,res)=>{
    if (jwt.verify(req.params.token2,process.env.EMAIL_SECRET)){
        verified = true
    }
    else{
        res.send("invalid token")
    }
})


module.exports = router
