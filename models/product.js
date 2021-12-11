const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')



const Product = mongoose.Schema({
    prod_name:{
        type : String,
        required : true
    },
    prod_id:{
        type : Number,
        required : true
    },
   
    prod_desc:{
        type : String,
        required :true
    },
    prod_price:{
        type : Number,
        required : true
    },
    prod_stock:{
        type: Number,
        required:true
    }

    
})
User.pre('save',async function(next){

    try{
        const key_ran = require('crypto').randomBytes(3).toString('hex')
        this.prod_id = key_ran
        next()

    }
    catch(error){
        next(error)
    }
    
})

module.exports = mongoose.model('product', Product);