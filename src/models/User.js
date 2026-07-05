import mongoose, { Schema } from "mongoose";


const userSchema  = new Schema(
    {
        name: {type:String,required:true},
        avgTransactionAmount:{type:Number, default: 0},
        stdDevTransactionAmount:{type:Number, default:0},
        // Values stored as decimals (0-1) representing % of transactions in each bucket
        timeBucketDistribution: {
            morning: { type: Number, default: 0 },
            afternoon: { type: Number, default: 0 },
            evening: { type: Number, default: 0 },
            lateNight: { type: Number, default: 0 }
        },
        transactionCount :{type:Number,default:0},
        m2:{type:Number,default:0}
    }
)

const User =mongoose.model("User",userSchema);
export{User};