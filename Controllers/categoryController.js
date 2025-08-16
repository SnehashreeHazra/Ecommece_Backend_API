const asyncHandler=require("express-async-handler")
const category_tbl=require("../Models/categoryModel.js")


//@description get all categories
//@routes GET api/category
//@access Public

const getCategories=asyncHandler( async (req,res)=>{
    const all_category=await category_tbl.find()
    res.status(200).json({success:true,message:"Get Category all Okay",data_length:all_category.length,data:all_category})
})
//@description get selected categories
//@routes GET api/category/:id
//@access Public

const getSelectedCategories=asyncHandler( async (req,res)=>{
    const data= await category_tbl.findById(req.params.id)
    if(!data){
        res.status(404)
        throw new Error('Category Not Found')
    }
    
    res.status(200).json({success:true,message:"get slected categories success",data:data})
})

//@description post category
//@routes POST api/category
//@access Public

const postCategories=asyncHandler( async (req,res)=>{
    const {name,color,icon}=req.body
    const new_category=await category_tbl.create({
        name,color,icon
    })
    if(!new_category){
        res.status(403)
        throw new Error('category can not be created')
    }
    res.status(200).json({success:true,message:"post categories success",data:new_category})
})

//@description update category
//@routes PUT api/category/:id
//@access Public

const updateCategories=asyncHandler( async (req,res)=>{
    if (Object.keys(req.body).length === 0) {
        res.status(400);
        throw new Error("Please Provide Value");
    }
    const {name,color,icon}=req.body
    const update_category=await category_tbl.findByIdAndUpdate(req.params.id,{
        name,color,icon
    },{new:true})
    if(!update_category){
        res.status(404)
        throw new Error('Category Not Found,not be updated')
    }
    res.status(200).json({success:true,message:"updated categories success",data:update_category})
})

//@description delete category
//@routes DELETE api/category/:id
//@access Public

const deleteCategories=asyncHandler( async (req,res)=>{
    const given_data= await category_tbl.findByIdAndDelete(req.params.id)
    if(!given_data){
        res.status(404)
        throw new Error('Category Not Found')
    }
    
    res.status(200).json({success:true,message:"delete categories success",data:given_data})
})


module.exports={getCategories,postCategories,deleteCategories,getSelectedCategories,updateCategories}