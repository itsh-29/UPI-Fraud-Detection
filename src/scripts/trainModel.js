import fs from "fs";
import * as tf from "@tensorflow/tfjs";

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

const normalizedDataset = dataset.map(example => {
  const normalizedZscore = normalFunction(example.features.zscore, minZscore, maxZscore);
  const normalizedAmount = normalFunction(example.features.amount, minAmount, maxAmount);
  const noveltyAsNumber = +example.features.noveltyRisk;
  const timeAnomalyAsNumber = +example.features.timeAnomalyRisk;

  return {
    features: [normalizedZscore, noveltyAsNumber, timeAnomalyAsNumber, normalizedAmount],
    label: example.label,
  };
});

console.log(normalizedDataset[0]);

const featureArrays = normalizedDataset.map(example => example.features);
const labels = normalizedDataset.map(example => example.label);


console.log(featureArrays[0]);
console.log(labels[0]);


// Tensor Part
const featureTensor = tf.tensor2d(featureArrays);
const labelTensor = tf.tensor2d(labels,[labels.length,1]);

featureTensor.print();
labelTensor.print();