import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import { resolvers } from './resolvers.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
const { SECRET } = process.env;
const typeDefs = readFileSync('./src/schema.graphql', { encoding: 'utf-8' });
const server = new ApolloServer({
    typeDefs,
    resolvers
});
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req, res }) => {
        // Get the user token from the headers.
        const token = req.headers.authorization;
        if (token) {
            try {
                const me = await jwt.verify(token, SECRET);
                // Put in context
                return me;
            }
            catch (e) {
                // Wrong token
                throw new Error('Wrong Token.');
            }
        }
        // No token
        return {};
    }
});
console.log(`🚀  Server ready at: ${url}`);
