const messageModel=require("../models/messageModel.js")
const addMessage=async(req,res,next)=>{
    try {
        const {from,to,message}=req.body
        console.log(from,to,message);
        const data=await messageModel.create({
            message:{text:message},
            users:[from,to],
            sender:from,
            
        })
        if(data){
            return res.json({msg:"added success"})
        }else{
            return res.json({msg:"Failed to add message"})
        }    
    } catch (error) {
        next(error)
        
    }
}

const getAllMessage=async(req,res,next)=>{
try{
let{from,to}=req.body

const messages=await messageModel.find({
    users:{
        $all:[from,to]
    }
}).sort({updatedAt:1})
const projectedMessages=messages.map((msg)=>{
    return{
        fromSelf:msg.sender.toString()===from,
        message:msg.message.text,
        createdAt :new Date(msg.createdAt).toLocaleString()
    }
})

res.json(projectedMessages)
}catch{

}
}

module.exports={
    addMessage,
    getAllMessage
}