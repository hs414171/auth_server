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

router.post('/verifyRefresh',(req,res)=>{
    const refreshToken = req.body.token
    if(!refreshToken){
        return res.json({message:"invalid access"})
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,(error,user)=>{
        if (!error){
            const accessToken = jwt.sign({_id : user._id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"2m"})
            return res.json({accessToken})
        }
        else{
            return res.json({message:"invalid access"})
        }
    })

})


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
    
    
    if (!user.verified) return res.send("email not confirmed")
    else{
        
        const accessToken = jwt.sign({_id : user._id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"2m"})
        const refreshToken = jwt.sign({_id : user._id},process.env.REFRESH_TOKEN_SECRET,{expiresIn:"7d"})
        res.json({accessToken,refreshToken})
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
            
            const token2 = jwt.sign({_id:newUser._id},process.env.EMAIL_SECRET)
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

router.patch('/updatePassword',async (req,res)=>{
    const query = {username:req.body.username}
    req.body.password = await bcrypt.hash(req.body.password, 8);
    
    const update_doc = {
        $set:{
            "password" : req.body.password,
            
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
router.patch('/updateName',async (req,res)=>{
    const query = {username:req.body.username}
    
    
    const update_doc = {
        $set:{

            "name" : req.body.name
            
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
router.patch('/updateNumber',async (req,res)=>{
    const query = {username:req.body.username}
   
    
    const update_doc = {
        $set:{
            
           
            "mobile" : req.body.mobile
            
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
router.patch('/updateEmail',async (req,res)=>{
    const query = {username:req.body.username}
    
    
    const update_doc = {
        $set:{
            
            "email": req.body.email
            
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
router.patch('/updateUsername',async (req,res)=>{
    const query = {username:req.body.username}
    
    
    const update_doc = {
        $set:{
            
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
router.get('/verification/:token2',async(req,res)=>{
    try {
        const user = jwt.verify(req.params.token2, process.env.EMAIL_SECRET)
        
        const query = {_id:user._id}
        const update_doc = {
            $set:{
                
                "verified": true
            }
        }
        const result = await User.findByIdAndUpdate(query,update_doc,{useFindAndModify : false , new:true})
        res.status(221).json({message:"Verified"})
        

        
      }catch (e) {
        res.send('error');
      }
})



module.exports = router