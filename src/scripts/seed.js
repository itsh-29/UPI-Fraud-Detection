import axios from "axios";

const BASE_URL= "http://localhost:5000";

function generateGuassianAmount(mean,stdDev){
    const u1 =Math.random();
    const u2 =Math.random();
    const z  =Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2);
    const amount = mean + z*stdDev;
    return Math.max(10,Math.round(amount));  
}

function generateFraudAmount(avg, stdDev) {
  if(stdDev === 0 )return null;
  const randZscore = Math.floor(Math.random()*6)+5; 
  const amount = (randZscore*stdDev)+ avg;  
  return amount;
}

function getRandomLateNightHour(){
    const lateNightHours  = [21,22,23,0,1,2,3,4];
    const randomIndex = Math.floor(Math.random() *lateNightHours.length);
    return lateNightHours[randomIndex];
}


async function createUser(){
    const userNames = [
    "Aarav Sharma", "Priya Patel", "Rohan Mehta", "Ananya Iyer", "Vikram Nair",
    "Diya Reddy", "Karan Kapoor", "Sneha Joshi", "Arjun Rao", "Ishita Verma"
    ];
    const userIds= [];
    for(const name of userNames){
        const response = await axios.post(`${BASE_URL}/users`,{name});
        userIds.push(response.data._id);
    }
    return userIds;

}
async function generateTransactionsForUser(senderId,allUserIds,senderIndex){
    const personalMean = Math.floor(Math.random()*2000) + 200;
    const personalStdDev = personalMean*0.3;

    const regularReceivers = allUserIds.filter((id,i)=> i !== senderIndex).slice(0,3);
    const transactionCount = Math.floor(Math.random()*100)+1;

    for(let i=0;i<transactionCount;i++){
        const amount = generateGuassianAmount(personalMean,personalStdDev);
        const isRegularReceiver =Math.random() < 0.8;
        const receiverId =isRegularReceiver ? regularReceivers[Math.floor (Math.random()* regularReceivers.length)]
        : allUserIds[Math.floor(Math.random() * allUserIds.length)];
    
        const randomHour = Math.floor(Math.random()*24);
        const randomMin = Math.floor(Math.random()*60);
        const randomSec = Math.floor(Math.random()*60);
        const randomMSec = Math.floor(Math.random()*60);
        const timestamp = new Date();
        timestamp.setHours(randomHour,randomMin,randomSec,randomMSec);

        const daysAgo = Math.floor(Math.random()*90);
        timestamp.setDate(timestamp.getDate()-daysAgo);

        await axios.post(`${BASE_URL}/transactions`,{
            senderId,
            receiverId,
            amount,
            timestamp:timestamp.toISOString(),
            note :"seed data",
        });
    }
}

async function seed() {
  const userIds = await createUser();
  
  for (let i = 0; i < userIds.length; i++) {
    await generateTransactionsForUser(userIds[i], userIds, i);
  }
}


export{generateFraudAmount,generateTransactionsForUser,createUser,getRandomLateNightHour,generateGuassianAmount,seed}
