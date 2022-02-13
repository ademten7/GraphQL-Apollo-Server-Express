const express = require("express");
const app = express();
const { ApolloServer, gql } = require("apollo-server-express");

const mongoose = require("mongoose");
const UsersCollection = require("./UserSchema");
const ProductsCollection = require("./ProductSchema");

//create mongoose connection
//create a database name :"graphql-data"
mongoose.connect("mongodb://127.0.0.1:27017/graphql-data", () =>
  console.log("connected to DB")
);

/*
Every GraphQL server (including Apollo Server) uses a schema to define the structure 
of data that clients can query. In this example, we'll create a server for querying
a collection of users by products.
*/

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  type ProductType {
    id: ID!
    title: String!
    price: Int
  }
  type UserType {
    id: ID!
    name: String!
    age: Int!
    products: [ProductType]
  }
  type Query {
    users: [UserType]
    user(id: ID): UserType
    products: [ProductType]
    product(id: ID): ProductType
  }
  type Mutation {
    addUser(name: String!, age: Int!): UserType
    updateUser(id: ID, name: String, age: Int): UserType
    addProduct(title: String!, price: Int!, userId: ID): ProductType
  }
  type Subscription {
    newUser: UserType
  }
`;

/*
We've defined our data set, but Apollo Server doesn't know that it should use that data
set when it's executing a query. To fix this, we create a resolver.

Resolvers tell Apollo Server how to fetch the data associated with a particular type. 
*/

// Resolvers define the technique for fetching the types defined in the schema.
const resolvers = {
  Query: {
    users: async (parent) => {
      //Populate will automatically replace the specified path in the document,
      // with document(s) from other collection(s).
      const users = await UsersCollection.find().populate("products");
      return users;
    },
    user: async (parent, args, context, info) => {
      const user = await UsersCollection.findById(args.Id).populate("products");
      console.log(context);
      return user;
    },
    products: async (parent, args) => {
      const products = await ProductsCollection.find();
      return products;
    },
    product: async (parent, args) => {
      const product = await ProductsCollection.findById(args.Id);
      return product;
    },
  },

  Mutation: {
    addUser: async (parent, args) => {
      const User = new UsersCollection(args);
      return await user.save();
    },

    updateUser: async (_, args) => {
      const updatedUser = await UsersCollection.findByIdAndUpdate(
        args.id, //find this id
        { ...args }, //and update with this args
        { new: true } // new: true==>updated quickly
      );
      return updatedUser;
    },

    addProduct: async (_, args, context) => {
      const product = new ProductsCollection({ ...args });
      await product.save();
      const user = await UsersCollection.findById(args.userId);
      user.products.push(product._id);
      await user.save();
      return product;
    },
  },

  Subscription: {},
};

//create an instance of ApolloServer
// he ApolloServer constructor requires two parameters: your schema definition(typeDefs) and
//your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

//you have to connect your app file with apolloServer with this code server.start....... so on

server.start().then(() => {
  //Purpose??????
  server.applyMiddleware({ app });
});
// server.listen().then(({ url }) => {
//   console.log(`🚀  Server ready at ${url}`);
// });
// The `listen` method launches a web server.
app.listen(4000, () => console.log(`apollo server is running: 4000`));
