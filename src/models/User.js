import mongoose, { Schema } from "mongoose";


const userSchema  = new Schema(
    {
        name: {type:String,required:true},
        avgTransactionAmount:{type:Number, default: 0},
        stdDevTransactionAmount:{type:Number, default:0},
        timeBucketCount: {
        morningCount: { type: Number, default: 0 },
        afternoonCount: { type: Number, default: 0 },
        eveningCount: { type: Number, default: 0 },
        lateNightCount: { type: Number, default: 0 }
        },
        transactionCount :{type:Number,default:0},
        m2:{type:Number,default:0}
    }
)

const User =mongoose.model("User",userSchema);
export{User};