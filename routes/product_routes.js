const express = import('express')
const router = express.Router()
router.get('/',(req,res)=>{
    res.json("test route")
})