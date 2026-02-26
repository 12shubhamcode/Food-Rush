const mongoose=require("mongoose")

const deliveryAssignmentSchema = new mongoose.Schema({
    order:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order",
    },
    shop:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Shop",
    },
    shopOrderId:{
        type:mongoose.Schema.Types.ObjectId,
       required:true
    },
    broadcastedTo:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }],
    assignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null,
    },
    status:{
        type:String,
        enum:["broadcasted","assigned","completed"],
        default:"broadcasted",
    },
    acceptedAt:Date,
},{timestamps:true})

const deliveryAssignment=mongoose.model("DeliveryAssignment",deliveryAssignmentSchema);
module.exports=deliveryAssignment;
 