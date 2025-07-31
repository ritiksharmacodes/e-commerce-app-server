import { Router } from "express";
import { query } from "../db/index.js";
import { hash } from "bcrypt";
import jwt from "jsonwebtoken";

const router = new Router();

router.post('/signup', async (request, response) => {    
    try {
        const email = request.body.email;
        const username = request.body.username;
        const pwd = request.body.password;

        const hashedPwd = await hash(pwd, 10);
        const res = await query('INSERT INTO users(username, email, password, auth_provider) VALUES ($1, $2, $3, $4)',
            [username, email, hashedPwd, 'local']
        );

        const token = jwt.sign({ "email": email, "username": username }, process.env.JWT_PRIVATE_KEY);
        response.cookie("user", token);

    } catch (error) {
        console.log(error);
        response.json(error);
    }
});

export { router };
