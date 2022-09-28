const express= require("express");
const { auth } = require("../middlewares/auth");
const {foodsModel,validateFood} = require("../models/foodModel")
const router = express.Router();

router.get("/" , async(req,res)=> {
  let perPage = req.query.perPage || 5;
  let page = req.query.page || 1;
  let sort = req.query.sort ||_id;
  let reverse = req.query.reverse == "yes" ? -1 : 1;

  try{
    let data = await foodsModel.find({})
    .limit(perPage)
    .skip((page - 1) * perPage)
    .sort({[sort]:reverse})
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(500).json({msg:"there error try again later",err})
  }
})


router.get("/search", async(req,res)=>{
  let perPage = Math.min(req.query.perPage,20)  || 10;
  let page = req.query.page || 1;
  try{
      let searchQ = req.query.s;
      let searchReg = new RegExp(searchQ,"i");
       let foods = await foodsModel.find({$or:[{name:searchReg},{info:searchReg}]})
       .limit(perPage)
       .skip((page-1)*perPage)
       res.json(foods);
  }
  catch(err){
      console.log(err);
      res.status(500).json({err:err});
  }
})
router.get("/category_id/:catname", async(req,res)=>{
  let perPage = Math.min(req.query.perPage,20)  || 10;
  let page = req.query.page || 1;
  try{
      let searchQ = req.params.catname;
      let searchReg = new RegExp(searchQ,"i");
       let foods = await foodsModel.find({category_id:searchReg})
       .limit(perPage)
       .skip((page-1)*perPage)
       res.json(foods);
  }
  catch(err){
      console.log(err);
      res.status(500).json({err:err});
  }
})

router.get("/prices", async(req, res) => {
  const max = req.query.max;
  const min = req.query.min;

  try {
      if (max && min) {
          let data = await foodsModel.find({ $and: [{ price: { $gte: min } }, { price: { $lte: max } }] })
          console.log(data)
          if (!data.length)
              return res.status(400).json({ msg: "no foods" })

          res.json(data)
      } else if (min) {
          let data = await foodsModel.find({ price: { $gte: min } })
          if (!data.length)
              return res.status(400).json({ msg: "no foods" })

          res.json(data)
      } else if (max) {
          let data = await foodsModel.find({ price: { $lte: max } })
          if (!data.length)
              return res.status(400).json({ msg: "no foods" })

          res.json(data)
      } else {
          let data = await foodsModel.find({})
          if (!data)
              return res.status(400).json({ msg: "no foods" })
          res.json(data)

      }
    
  } catch (err) {
      console.log(err);
      res.status(500).json({ msg: "there error try again later", err })
  }
})

router.post("/", auth,async(req,res) => {
  let validBody = validateFood(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  try{
    let cake = new foodsModel(req.body);
    // add the user_id of the user that add the cake
    cake.user_id = req.tokenData._id;
    await cake.save();
    res.status(201).json(cake);
  }
  catch(err){
    console.log(err);
    res.status(500).json({msg:"there error try again later",err})
  }
})


router.put("/:editId",auth, async(req,res) => {
  let validBody = validateFood(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  try{
    let editId = req.params.editId;
    let data;
    if(req.tokenData.role == "admin"){
      data = await foodsModel.updateOne({_id:editId},req.body)
    }
    else{
       data = await foodsModel.updateOne({_id:editId,user_id:req.tokenData._id},req.body)
    }
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(500).json({msg:"there error try again later",err})
  }
})

router.delete("/:delId",auth, async(req,res) => {
  try{
    let delId = req.params.delId;
    let data;
    // אם אדמין יכול למחוק כל רשומה אם לא בודק שהמשתמש
    // הרשומה היוזר איי די שווה לאיי די של המשתמש
    if(req.tokenData.role == "admin"){
      data = await foodsModel.deleteOne({_id:delId})
    }
    else{
      data = await foodsModel.deleteOne({_id:delId,user_id:req.tokenData._id})
    }
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(500).json({msg:"there error try again later",err})
  }
})

module.exports = router;