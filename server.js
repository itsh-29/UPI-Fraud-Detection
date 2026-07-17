import {app} from "./src/app.js"
import { connectDB } from "./src/config/db.js"
import { loadModel,loadNormalizationStats } from "./src/config/loadModel.js";
import dotenv from "dotenv"

dotenv.config();

const PORT = process.env.PORT || 5000;


Promise.all([connectDB(),loadModel()]).then(([_, loadedModel])=>{
    app.locals.model= loadedModel;
    app.locals.normalizationStats = loadNormalizationStats();

    app.listen(PORT,()=>{
        console.log(`Server running on port ${PORT}`);

    });
});

