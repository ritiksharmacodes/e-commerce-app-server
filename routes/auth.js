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
        const res = await query("INSERT INTO users(uuid, username, email, password, auth_provider) VALUES (uuid_generate_v4(), $1, $2, $3, 'local')",
            [username, email, hashedPwd]
        );

        const token = jwt.sign({ "email": email, "username": username }, process.env.JWT_PRIVATE_KEY);

        return response
            .cookie("user", token, {
                httpOnly: true,
                secure: true,         // Needed for HTTPS
                sameSite: 'None'      // Needed for cross-origin 
            })
            .status(201)
            .json({ message: "Signup successful", token });

    } catch (error) {
        console.log(error);
        return response.json(error);
    }
});

export { router };
