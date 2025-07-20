import { Router } from "express";
import { query } from "../db/index.js";

const productsRouter = new Router();

productsRouter.get('/:id', async (request, response) => {    
    try {
        const res = await query('SELECT * FROM products');        
        response.json( res.rows );
        
    } catch (error) {
        console.error(error);
        response.json({error});
    }
});

export default productsRouter;