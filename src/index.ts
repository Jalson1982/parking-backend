import express from 'express';
import {userRouter, platesRouter, parkingLotsRouter, timeSlotsRouter, creditsRouter, ordersRouter } from './routes/index';
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

const app = express();

async function main() {
app.use(express.json());
app.get('/', (_, res) => {
  res.send('Hello World');
});

const routes = [
    userRouter,
    platesRouter,
    parkingLotsRouter,
    timeSlotsRouter,
    creditsRouter,
    ordersRouter
]


routes.forEach((router) => {
    app.use(router);
})

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
};

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
