import mongoose ,{Schema } from "mongoose";

const TransactionSchema = new Schema(
    {
        senderId: { type: mongoose.Schema.Types.ObjectId,ref: "User",required: true},
        receiverId:{type: mongoose.Schema.Types.ObjectId,ref: "User", required: true},
        amount:{type:Number,required:true},
        timestamp:{type:Date,required:true},
        note:{type:String}
    }
)

const Transaction = mongoose.model("Transaction",TransactionSchema);
export{Transaction}