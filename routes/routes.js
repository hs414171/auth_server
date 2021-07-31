require('dotenv').config()
const express = require('express')
const router = express.Router()

const User = require('../models/user')
const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')
const { registerValidation , loginValidation } = require('../validation')



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

    var username = req.body.username;
    var password = req.body.password;
    User.findOne({ username })
    .then(user => {
        
        if (!user) return res.status(400).json({ msg: "User not exist" })

        
        bcrypt.compare(password, user.password, (err, data) => {
            
            if (err) throw err

            
            if (data) {
                return res.status(200).json({ msg: "Login success" })
            } else {
                return res.status(401).json({ msg: "Invalid credential" })
            }

        })

    })
    
    

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
