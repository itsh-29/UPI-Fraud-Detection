import { User } from "../models/User.js";
import { ReceiverRelationship } from "../models/ReceiverRelationship.js";
import {Transaction} from "../models/Transaction.js";


import { calculateAnomalyScore } from "../services/anomalyService.js"
import { checkNoveltyRisk } from "../services/anomalyService.js";
import { calculateZScore } from "../services/anomalyService.js";
import { checkTimeAnomalyRisk } from "../services/anomalyService.js";

import { getTimeBucket } from "../utils/timeBucket.js";


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

    const bucketPercentage = sender.timeBucketDistribution[bucket];

    const zscore = calculateZScore(amount,sender.avgTransactionAmount,sender.stdDevTransactionAmount);
    const noveltyRisk = checkNoveltyRisk(amount,sender.avgTransactionAmount,relationshipExists);
    const timeAnomalyRisk = checkTimeAnomalyRisk(bucketPercentage,hasHistory);
    
    const anomalyScore =calculateAnomalyScore(zscore,noveltyRisk,timeAnomalyRisk)

    const transaction = await Transaction.create({senderId,receiverId,amount,timestamp,note});

    res.status(201).json({
        transaction: transaction,
        anomalyScore: anomalyScore
    });
}

export{createTransaction};