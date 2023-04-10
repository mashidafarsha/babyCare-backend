const router = require('express').Router()
const {adminLogin,addCategory,getAllCategory,deleteCategory,editCategory}=require('../controller/adminController')


router.get('/')
router.post('/adminLogin',adminLogin)
router.post('/addCategory',addCategory)
router.get('/getCategory',getAllCategory)
router.delete('/deleteCategory/:Id',deleteCategory)
router.delete('/editCategory',editCategory)




module.exports=router