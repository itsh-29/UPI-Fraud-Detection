import { User } from "../models/User.js";
import { calculateZScore, checkNoveltyRisk, checkTimeAnomalyRisk } from "../services/anomalyService.js";
import { getTimeBucket } from "../utils/timeBucket.js";
import { generateFraudAmount,generateGuassianAmount,getRandomLateNightHour } from "./seed.js";
import fs from "fs";
import { connectDB } from "../config/db.js";

function generateFraudTransactionForUser(sender,allUserIds,senderIndex){
  const{avgTransactionAmount,stdDevTransactionAmount,timeBucketCount,transactionCount} = sender;
  // 1. get a fraud amount using generateFraudAmount(avg, stdDev)
  const fraudAmount = generateFraudAmount(avgTransactionAmount,stdDevTransactionAmount);
  // 2. if that's null (stdDev was 0), skip - return early somehow
  if(fraudAmount === null) return null;

  // 3. force a brand new receiver (NOT from any "regular" pool - pick from allUserIds, excluding senderId)
  const possibleReceivers =allUserIds.filter((id,i)=> i !== senderIndex);
  const receiverId = possibleReceivers[Math.floor(Math.random()*possibleReceivers.length)];
  // 4. get a late-night hour using getRandomLateNightHour()
  const lateNightHour = getRandomLateNightHour();
  
  // 5 Build the timestamp
  const timestamp = new Date();
  timestamp.setHours(lateNightHour,0,0,0);
  const daysAgo = Math.floor(Math.random()*90);
  timestamp.setDate(timestamp.getDate()-daysAgo);

    // 6. compute real features using the sender's ACTUAL current stats
    const zscore = calculateZScore(fraudAmount,avgTransactionAmount,stdDevTransactionAmount);
    const noveltyRisk = checkNoveltyRisk(fraudAmount,avgTransactionAmount,false);

    const hasHistory = stdDevTransactionAmount !== 0;
    const lateNightPercentage = transactionCount === 0? 0 : timeBucketCount.lateNightCount/ transactionCount;
    const timeAnomalyRisk =  checkTimeAnomalyRisk(lateNightPercentage,hasHistory);

    return{

        features:{zscore,noveltyRisk,timeAnomalyRisk,amount:fraudAmount},
        label :1,

    }
}

function generateNormalTrainingExample(sender,regularReceivers,allUserIds,senderIndex){
    const{avgTransactionAmount,stdDevTransactionAmount,timeBucketCount,transactionCount} = sender;

    const normalAmount = generateGuassianAmount(avgTransactionAmount,stdDevTransactionAmount);
    
    const isRegularReceiver = Math.random()< 0.8;
    const receiverId = isRegularReceiver ? regularReceivers[Math.floor(Math.random()* regularReceivers.length)]
    : allUserIds.filter((id,i) => i !== senderIndex)[Math.floor(Math.random()*(allUserIds.length-1))]; 

    const randomHour = Math.floor(Math.random()*24);
    const timestamp = new Date();
    timestamp.setHours(randomHour,0,0,0);
    const daysAgo = Math.floor(Math.random()*90);
    timestamp.setDate(timestamp.getDate()-daysAgo);

    const zscore = calculateZScore(normalAmount,avgTransactionAmount,stdDevTransactionAmount);
    const noveltyRisk = checkNoveltyRisk(normalAmount,avgTransactionAmount,isRegularReceiver);

    const hasHistory = stdDevTransactionAmount !== 0;
    const bucket = getTimeBucket(timestamp);
    const bucketCount = timeBucketCount[bucket +"Count"];
    const bucketPercentage = transactionCount === 0 ? 0 : bucketCount/transactionCount;    
    const timeAnomalyRisk =  checkTimeAnomalyRisk(bucketPercentage,hasHistory);

    return{

        features:{zscore,noveltyRisk,timeAnomalyRisk,amount:normalAmount},
        label :0,

    }
}
async function generateTrainingDataset(){
    await connectDB();
    const allUsers = await User.find({});
    const allUserIds = allUsers.map(u=>u._id);
    const dataset =[];
    for(let senderIndex=0;senderIndex<allUsers.length;senderIndex++){
        const sender =allUsers[senderIndex];
        const regularReceivers = allUserIds.filter((id,idx)=>idx !== senderIndex).slice(0,3);

        const normalCount = Math.floor(Math.random()*20)+10;
        const fraudCount  = Math.floor(Math.random()*4)+2;
        for(let i=0;i<normalCount;i++){
            const example = generateNormalTrainingExample(sender,regularReceivers,allUserIds,senderIndex);
            dataset.push(example);
        } 
        for(let i=0;i<fraudCount;i++){
            const example = generateFraudTransactionForUser(sender,allUserIds,senderIndex);
            if(example !== null){
                dataset.push(example);
            }
        }
    }

    const datasetJson = JSON.stringify(dataset,null,2);
    fs.writeFileSync("trainingData.json",datasetJson); 
    console.log(`Generated ${dataset.length} training examples.`);

    return dataset;
}

generateTrainingDataset();


export{generateFraudTransactionForUser,generateNormalTrainingExample,generateTrainingDataset};