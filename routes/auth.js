import { Router } from "express";
import { query } from "../db/index.js";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import verify from "../services/googleSignin.js";
import { generateFromEmail } from "unique-username-generator";

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

router.post('/signin', async (request, response) => {
    try {
        const auth_provider = request.body?.auth_provider;

        if (auth_provider === 'local') {
            const email = request.body.email;
            const pwd = request.body.password;

            const res = await query('SELECT * FROM users WHERE email=$1', [email]);

            if (!res.rows[0]) return response.json({ result: "error", message: "email not found" });

            const fetched_hashed_pwd = res.rows[0].password;
            const result_of_checking_the_pwd = await compare(pwd, fetched_hashed_pwd);

            if (result_of_checking_the_pwd === true) {
                const token = jwt.sign({ "email": email, "username": res.rows[0].username }, process.env.JWT_PRIVATE_KEY);
                return response
                    .cookie("user", token, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "None"
                    })
                    .status(201)
                    .json({ "result": "success", "message": "user found", "token": token });
            }
            else return response.json({ result: "error", message: "email matched but password did not match" });
        }
        else if (auth_provider === 'google') {
            const payload = await verify(request.body.code.code);
            const googleId = payload?.sub;
            const email = payload?.email;
            const username = generateFromEmail((payload?.name || "user"), 4);

            const res = await query('SELECT * FROM users WHERE google_id=$1', [googleId]);
            console.log(res);
            
            if (!res.rows[0]) {
                // user does not exist. Insert him
                const res2 = await query("INSERT INTO users(username, email, auth_provider, google_id) VALUES ($1, $2, $3, $4)",
                    [username, email, auth_provider, googleId]
                );

                if (res2.command === 'INSERT') {
                    // create JWT and respond
                    const token = jwt.sign({ "email": email, "username": username }, process.env.JWT_PRIVATE_KEY);
                    return response
                        .cookie("user", token, {
                            httpOnly: true,
                            secure: true,
                            sameSite: "None"
                        })
                        .status(201)
                        .json({ "result": "success", "message": "google user inserted", "token": token });
                }

            }

        }
    } catch (error) {
        console.log(error);
        return response.json(error);
    }
})

export { router };
