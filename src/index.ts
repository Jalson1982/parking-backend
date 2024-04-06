import express from 'express';
import {userRouter, platesRouter, parkingLotsRouter} from './routes/index';
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

const app = express();

async function main() {
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Hello World');
});

const routes = [
    userRouter,
    platesRouter,
    parkingLotsRouter,
]

routes.forEach((router) => {
    app.use(router);
})

app.listen(7200, () => {
  console.log('Server is running on http://localhost:3000');
});
};

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
