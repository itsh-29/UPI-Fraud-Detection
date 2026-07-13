import fs from "fs";

const rawData = fs.readFileSync("trainingData.json","utf-8");
const rawdataset = JSON.parse(rawData);

const dataset  = rawdataset.filter( nonNull => nonNull.features.zscore !== null );

const amounts = dataset.map(example => example.features.amount);

const minAmount = Math.min(...amounts);
const maxAmount = Math.max(...amounts);

const zscore = dataset.map(example=>example.features.zscore);


const minZscore = Math.min(...zscore);
const maxZscore = Math.max(...zscore);

function normalFunction(value,min,max){
    return ((value -min)/ (max-min)); 
}