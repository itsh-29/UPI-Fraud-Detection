import fs from "fs";
import * as tf from "@tensorflow/tfjs";
import { normalFunction } from "../utils/normalize.js";
const FRAUD_THRESHOLD = 0.3;
const rawData = fs.readFileSync("trainingData.json","utf-8");
const rawdataset = JSON.parse(rawData);

const dataset  = rawdataset.filter( nonNull => nonNull.features.zscore !== null );

const amounts = dataset.map(example => example.features.amount);

const minAmount = Math.min(...amounts);
const maxAmount = Math.max(...amounts);

const zscore = dataset.map(example=>example.features.zscore);


const minZscore = Math.min(...zscore);
const maxZscore = Math.max(...zscore);

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

//shuffle first
const shuffled = normalizedDataset.sort(()=>Math.random()-0.5);

const splitIndex = Math.floor(shuffled.length*0.8);
const trainData = shuffled.slice(0,splitIndex);
const testData = shuffled.slice(splitIndex);

const trainFeatures = trainData.map(example=>example.features);
const trainLabels = trainData.map(example=>example.label);
const testFeatures = testData.map(example=>example.features);
const testLabels = testData.map(example=>example.label);

// Tensor Part

//Traning Part
const featureTensor_train = tf.tensor2d(trainFeatures);
const labelTensor_train = tf.tensor2d(trainLabels,[trainLabels.length,1]);

//Testing Part
const featureTensor_test = tf.tensor2d(testFeatures);
const labelTensor_test = tf.tensor2d(testLabels,[testLabels.length,1]);

const model = tf.sequential();

model.add(tf.layers.dense({inputShape:[4],units:8,activation:"relu"}));
model.add(tf.layers.dense({units:4,activation:"relu"}))
model.add(tf.layers.dense({units:1,activation:"sigmoid"}))


async function trainModel() {
  model.compile({
    optimizer:"adam",
    loss:"binaryCrossentropy",
    metrics:["accuracy"],
  });

  const history = await model.fit(featureTensor_train,labelTensor_train,{
    epochs:50,
    batchSize:32,
    shuffle:true,
     callbacks: {
    onEpochEnd: (epoch, logs) => {
      console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
    },
  },
  });
  
  console.log("Training complete!");
  console.log(history.history);

  const predictions = model.predict(featureTensor_test);
  predictions.print();
  // console.log("Max prediction:", predictions.max().dataSync()[0]);
  // console.log("Min prediction:", predictions.min().dataSync()[0]);

  const predictedArray = predictions.dataSync();
  const predictedLabels  = predictedArray.map(probability => +(probability >=FRAUD_THRESHOLD));

  let TP =0;
  let FP =0;
  let FN =0;
  let TN =0;
  for(let i=0;i<predictedArray.length;i++){
    const predicted = predictedLabels[i];
    const actual = testLabels[i];
    if(predicted === 1 && actual === 1){
      TP++;
    }else if(predicted === 1 && actual === 0){
      FP++;
    } else if(predicted === 0 && actual === 1){
      FN++;
    }
    else{
      TN++;
    }

  }

  const precision = TP / (TP + FP);
  const recall = TP / (TP + FN);
  const f1 = 2 * (precision * recall) / (precision + recall);

  console.log(`TP: ${TP}, FP: ${FP}, FN: ${FN}, TN: ${TN}`);
  console.log(`Precision: ${precision.toFixed(4)}`);
  console.log(`Recall: ${recall.toFixed(4)}`);
  console.log(`F1 Score: ${f1.toFixed(4)}`);

  const normalizationStats = {
    minZscore: minZscore,
    maxZscore: maxZscore,
    minAmount: minAmount,
    maxAmount: maxAmount,
  };


  const saveResult = await model.save(tf.io.withSaveHandler(async (artifacts) => {
  fs.writeFileSync("modelTopology.json", JSON.stringify(artifacts.modelTopology));
  fs.writeFileSync("modelWeights.bin", Buffer.from(artifacts.weightData));
  fs.writeFileSync("modelWeightSpecs.json", JSON.stringify(artifacts.weightSpecs));
  fs.writeFileSync("normalizationStats.json", JSON.stringify(normalizationStats, null, 2));
  return { modelArtifactsInfo: { dateSaved: new Date(), modelTopologyType: "JSON" } };
}));

}
trainModel();