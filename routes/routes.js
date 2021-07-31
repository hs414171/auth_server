const express = require('express')
const router = express.Router()

const User = require('../models/user')


router.get('/get-users', async (req,res)=>{
    try{
        const userData =  await User.find()
        res.json(userData)
    }catch(error){
        res.status(500).json({message: error.message})
    }
})

router.post('/login', async (req, res)=>{

    var username = req.body.username;
    var password = req.body.password;

    let state = false;

    if(username.length != 0 && password.length != 0){
        // BOTH USERNAME AND PASSWORD ARE PRESENT
        const users = await User.find();
        let currentUser;
        users.forEach((user)=>{
            // IF USERNAME IS CORRECT
            if(username === user.username){
                // STORE USER(FROM DATABASE) WHO IS TRYING TO LOG IN
                currentUser = user;
                // IF PASSWORD IS CORRECT
                if(password === currentUser.password){
                    state = true;
                }
            }
        });
    }

    // IF BOTH USERNAME AND PASSWORD ENTERED WERE CORRECT STATE ---> true
    if(state){
        res.status(203).json({message: `${username} logged in`});
    }else{
        res.status(410).json({message: 'invalid credentials'});
    }
});

router.post('/reg/user', async (req, res)=>{

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
    })   
        try{
            const newUser = await user.save()
            res.status(201).json({message: 'new user created', user: newUser})
        }catch(error){
            res.status(400).json({message: error.message})
        }
    }
    
});





module.exports = router
