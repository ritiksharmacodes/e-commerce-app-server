import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from 'cors';
import helmet from "helmet";


import productsRouter from "./routes/products.js";
import { router as authRouter } from "./routes/auth.js";

const app = express();

app.use(morgan('common'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({
    extended: true,
    limit: '50mb'
}));
app.use(cors());
app.use(helmet());


const currentApiPath = '/api/v1/';

app.use(`${currentApiPath}products`, productsRouter);
app.use(`${currentApiPath}auth`, authRouter);

app.listen(process.env.PORT, () => console.log(`The server is listening at port: ${process.env.PORT}`));
