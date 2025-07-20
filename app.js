import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from 'cors';

import productsRouter from "./routes/products.js";

const app = express();

app.use( morgan('common') );
app.use( cors() );

const currentApiPath = '/api/v1/';

app.use(`${currentApiPath}products`, productsRouter);

app.listen( process.env.PORT, ()=>console.log(`The server is listening at port: ${process.env.PORT}`) );
