const express = import('express')
const router = express.Router()
const Prod = require('../models/product')
router.get('/',(req,res)=>{
    res.json("test route")
})
router.post('/add_product', async (req, res)=>{
    const prod_name = req.body.prod_name
    const product = await Prod.find()
    let state = 0

    
    for(var ind in users){
        if(prod_name === product[ind].prod_name){
            res.status(414).json({message: 'this product already exists'})
            state = 1
            break
        }
    }

    
    if(state === 0){
        const products = new Prod({
            prod_name: req.body.prod_name,
            prod_desc: req.body.prod_desc,
            prod_price: req.body.prod_price,
            prod_stock: req.body.prod_stock
    })   
        try{
            const newProduct = await products.save()
            res.status(201).json({message: 'new product created', products:newProduct})
            
            
            
            
        }catch(error){
            res.status(400).json({message: error.message})
        }
    }
    
});
router.patch('/updateName',async (req,res)=>{
    const query = {prod_name:req.body.prod_name}
    
    const update_doc = {
        $set:{
            "prod_name" : req.body.prod_name_ch,
            
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
router.patch('/updateDesc',async (req,res)=>{
    const query = {prod_name:req.body.prod_name}
    
    const update_doc = {
        $set:{
            "prod_desc" : req.body.prod_desc,
            
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
router.patch('/updatePrice',async (req,res)=>{
    const query = {prod_name:req.body.prod_name}
    
    const update_doc = {
        $set:{
            "prod_price" : req.body.prod_price,
            
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
router.patch('/updateStock',async (req,res)=>{
    const query = {prod_name:req.body.prod_name}
    
    const update_doc = {
        $set:{
            "prod_stock" : req.body.prod_stock,
            
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

