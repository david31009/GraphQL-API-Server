import { readFileSync } from 'fs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const { SECRET } = process.env;

// define types
type singleUser = { account: string; password: string; name: string; birthday: string };
type allUsers = Array<singleUser>;
type dataJson = { [key: string]: allUsers };

// parse json
const data: dataJson = JSON.parse(readFileSync('./src/data.json', { encoding: 'utf-8' }));

// read data
const users: allUsers = data['users'];

// define resolvers
const resolvers = {
  Query: {
    // Get context value from me
    me: (parent, args, me) => {
      return me;
    }
  },
  Mutation: {
    login: async (parent, args) => {
      // args => user input
      const account: string = args.account;
      const password: string = args.password;

      // find user data from data.json
      const user: singleUser = users.find((element) => element['account'] === account);

      // Error handling
      if (!user) throw new Error('Account Not Exists');

      const passwordIsValid: boolean = await bcrypt.compare(password, user.password);

      if (!passwordIsValid) throw new Error('Wrong Password');

      // login successfully, return jwt Token
      const token: String = await jwt.sign(
        { account: user.account, name: user.name, birthday: user.birthday },
        SECRET,
        { expiresIn: '1 day' }
      );

      return { token: `${token}` };
    }
  }
};

export { resolvers };
