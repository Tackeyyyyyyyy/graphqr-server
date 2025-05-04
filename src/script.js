// server.js
const { ApolloServer, gql } = require('apollo-server');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const typeDefs = gql`
  type User {
    id: Int!
    email: String!
    name: String
    posts: [Post!]!
  }

  type Post {
    id: Int!
    title: String!
    content: String
    published: Boolean!
    author: User!
  }

  type Query {
    users: [User!]!
    user(id: Int!): User
    posts: [Post!]!
    post(id: Int!): Post
  }

  type Mutation {
    createUser(email: String!, name: String): User!
    createPost(title: String!, content: String, authorId: Int!): Post!
    updatePost(id: Int!, title: String, content: String, published: Boolean): Post!
    deletePost(id: Int!): Post!
  }
`;

const resolvers = {
    Query: {
        users: () => prisma.user.findMany({ include: { posts: true } }),
        user: (_, args) => prisma.user.findUnique({ where: { id: args.id }, include: { posts: true } }),
        posts: () => prisma.post.findMany({ include: { author: true } }),
        post: (_, args) => prisma.post.findUnique({ where: { id: args.id }, include: { author: true } }),
    },
    Mutation: {
        createUser: (_, args) => prisma.user.create({ data: args }),
        createPost: (_, args) => prisma.post.create({ data: args }),
        updatePost: (_, args) =>
            prisma.post.update({
                where: { id: args.id },
                data: {
                    title: args.title,
                    content: args.content,
                    published: args.published,
                },
            }),
        deletePost: (_, args) => prisma.post.delete({ where: { id: args.id } }),
    },
    Post: {
        author: (parent) => prisma.user.findUnique({ where: { id: parent.authorId } }),
    },
    User: {
        posts: (parent) => prisma.post.findMany({ where: { authorId: parent.id } }),
    },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});
