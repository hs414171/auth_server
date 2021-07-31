const express = require('express')
const router = express.Router()
const verify = require('./verifytoken')

router.get('/',verify,(req,res)=>{
    res.json({
        posts:{
            title:"My first post",
            description:"no access data"
        }
    })
})

module.exports = router