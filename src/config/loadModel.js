

import * as tf from "@tensorflow/tfjs"
import fs from "fs";

async function loadModel() {
    const weightBuffer = fs.readFileSync("modelWeights.bin");
    const weightData = weightBuffer.buffer.slice(
        weightBuffer.byteOffset,
        weightBuffer.byteOffset+weightBuffer.byteLength
    );
    const modelTopology = JSON.parse(fs.readFileSync("modelTopology.json", "utf-8"));
    const weightSpecs = JSON.parse(fs.readFileSync("modelWeightSpecs.json", "utf-8"));

    const model = await tf.loadLayersModel(
        tf.io.fromMemory({
            modelTopology:modelTopology,
            weightSpecs:weightSpecs,
            weightData:weightData,
        })
    );
    return model;
}

function loadNormalizationStats(){
    const stats = JSON.parse(fs.readFileSync("normalizationStats.json","utf-8"));
    return stats;
}

export{loadModel,loadNormalizationStats};

