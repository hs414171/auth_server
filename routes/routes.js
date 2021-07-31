require('dotenv').config()
const express = require('express')
const router = express.Router()

const User = require('../models/user')
const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')
const { registerValidation , loginValidation } = require('../validation')
const { valid } = require('@hapi/joi')



router.get('/get-users', async (req,res)=>{
    try{
        const userData =  await User.find()
        res.json(userData)
    }catch(error){
        res.status(500).json({message: error.message})
    }
})

router.post('/login', async (req, res)=>{
    const {error} = loginValidation(req.body)
    
    if (error) return res.status(400).send(error.details[0].message)

    const user = await User.findOne({username : req.body.username})
    if (!user) return res.status(400).send("Email not found")
    
    const validPass = await bcrypt.compare(req.body.password,user.password)
    if (!validPass) return res.status(400).send("Password not found")
    const token = jwt.sign({_id : user._id},process.env.ACCESS_TOKEN_SECRET)
    res.header("auth-token",token).send(token)
    res.send("Login successfull")
    
    
    
    

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
            name: req.body.name
    })   
        try{
            const newUser = await user.save()
            res.status(201).json({message: 'new user created', user: newUser})
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

module.exports = router
