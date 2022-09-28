const mongoose = require('mongoose');
const Joi = require('joi')

const foodsSchema = new mongoose.Schema({
    name:String,
    info:String,
    price:Number,
    img:String,
    user_id:String,
    date_created:{
      type:Date, default:Date.now()
    },
    category_id:{
      type:String,default:"1"
    }
})

exports.foodsModel = mongoose.model("foods", foodsSchema);

exports.validateFood = (_reqBody) =>{
    let schemaJoi = Joi.object({
        name: Joi.string().min(2).max(99).required(),
        info: Joi.string().min(0).max(9999).required(),
        price: Joi.number().min(1).max(9999).required(),
        img: Joi.string().min(2).max(500).allow(null,""),
        category_id: Joi.string().min(2).max(500).required()
    })
    return schemaJoi.validate(_reqBody);
}
