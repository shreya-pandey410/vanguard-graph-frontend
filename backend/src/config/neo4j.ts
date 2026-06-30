import dotenv from "dotenv";
import neo4j from "neo4j-driver";

dotenv.config({
    path: "./src/.env"
});
console.log(process.env.NEO4J_URI);

const uri = process.env.NEO4J_URI!;
const username = process.env.NEO4J_USERNAME!;
const password = process.env.NEO4J_PASSWORD!;

const driver = neo4j.driver(
    uri,
    neo4j.auth.basic(username, password)
);

export default driver;