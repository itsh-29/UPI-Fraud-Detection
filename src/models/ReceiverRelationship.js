import mongoose ,{Schema } from "mongoose";

const ReceiverRelationShipSchema = new Schema(
    {
            userId:{ 
                type: mongoose.Schema.Types.ObjectId, 
                ref: "User", 
                required: true 
            },
            receiverId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: "User", 
                required: true 
            },
            transactionCount:{type:Number,required:true},
            lastTransactionTimestamp:{type:Date,required:true }

    }
)

const ReceiverRelationship = mongoose.model("ReceiverRelationship",ReceiverRelationShipSchema);
export{ReceiverRelationship}