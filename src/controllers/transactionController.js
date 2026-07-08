import { User } from "../models/User.js";
import { ReceiverRelationship } from "../models/ReceiverRelationship.js";
import {Transaction} from "../models/Transaction.js";


import { calculateAnomalyScore } from "../services/anomalyService.js"
import { checkNoveltyRisk } from "../services/anomalyService.js";
import { calculateZScore } from "../services/anomalyService.js";
import { checkTimeAnomalyRisk } from "../services/anomalyService.js";

import { getTimeBucket } from "../utils/timeBucket.js";

import{updateUserStats} from "../services/statsService.js"

async function createTransaction(req,res){
    const{senderId,receiverId,amount,timestamp,note}=req.body;
    
    const sender = await User.findById(senderId);

    if(!sender){
        return res.status(404).json({error:"Sender not found"});
    }

    const relationship = await ReceiverRelationship.findOne({userId:senderId,receiverId});
    const relationshipExists  = !!relationship;

    const hasHistory = sender.stdDevTransactionAmount !== 0;
    const bucket = getTimeBucket(timestamp);

    const bucketCount = sender.timeBucketCount[bucket+"Count"];

    const bucketPercentage = (sender.transactionCount === 0 ? 0 : (bucketCount/sender.transactionCount)); 

    const zscore = calculateZScore(amount,sender.avgTransactionAmount,sender.stdDevTransactionAmount);
    const noveltyRisk = checkNoveltyRisk(amount,sender.avgTransactionAmount,relationshipExists);
    const timeAnomalyRisk = checkTimeAnomalyRisk(bucketPercentage,hasHistory);
    
    const anomalyScore =calculateAnomalyScore(zscore,noveltyRisk,timeAnomalyRisk)

    const transaction = await Transaction.create({senderId,receiverId,amount,timestamp,note});

    const stats = updateUserStats(sender.avgTransactionAmount,sender.transactionCount,sender.m2,amount);

    const updateUser = await User.findByIdAndUpdate(senderId,{
            avgTransactionAmount: stats.newAvg,
            stdDevTransactionAmount:stats.newStd,
            m2:stats.newM2,
            transactionCount:stats.newCount,
            $inc: { [`timeBucketCount.${bucket}Count`]: 1 } 
    },{new:true });

    if (relationshipExists) {
        await ReceiverRelationship.findByIdAndUpdate(
            relationship._id,
            {
            $inc: { transactionCount: 1 },
            lastTransactionTimestamp: timestamp,
            }
        );
    } else {
        await ReceiverRelationship.create({
            userId: senderId,
            receiverId: receiverId,
            transactionCount: 1,
            lastTransactionTimestamp: timestamp,
        });
    }

    res.status(201).json({
        transaction: transaction,
        anomalyScore: anomalyScore
    });
}

async function getAllTransactions(req, res) {
    const Transactions = await Transaction.find({});
    res.status(200).json(Transactions);

}

export{createTransaction,getAllTransactions};