import { Pool } from "pg";

const pool = new Pool();

export const query = (queryText, params) => {
    return pool.query(queryText, params);
};