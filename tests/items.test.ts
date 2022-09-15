import supertest from 'supertest';
import app from '../src/app';
import {prisma} from '../src/database';
import { items,  } from '@prisma/client';
import {faker} from '@faker-js/faker';

const itenToTest : Omit<items, 'id'>  =  {
  title:  faker.lorem.words(3),       
  url: faker.internet.url(),         
  description: faker.lorem.sentence(), 
  amount: Number(faker.finance.amount(0, 1000, 0))      
}
console.log(itenToTest);

describe('Testa POST /items ', () => {
  it('Deve retornar 201, se cadastrado um item no formato correto', async ()=>{

    const result = await supertest(app).post('/items').send(itenToTest);

    const createItems  = await prisma.items.findUnique({
      where: {title: itenToTest.title}
    })

    expect(result.status).toBe(201);
    expect(createItems).not.toBeNull();

  });
  it('Deve retornar 409, ao tentar cadastrar um item que exista',async () => {
  const result = await supertest(app).post('/items').send(itenToTest);

  expect(result.status).toBe(409);
  });
});

describe('Testa GET /items ', () => {
  it('Deve retornar status 200 e o body no formato de Array',async () => {
    const result = await supertest(app).get('/items').send();

    expect(result.status).toBe(200);
    expect(result.body).toBeInstanceOf(Array);
    
  });
});

describe('Testa GET /items/:id ', () => {

  it('Deve retornar status 200 e um objeto igual a o item cadastrado',async () => {

    const items = await prisma.items.findMany();
    const ids = items.map((values : items) => values.id);
    const randomId = Number(faker.finance.amount(0, (ids.length-1), 0));
    const idToTest = ids[randomId];

    const result = await supertest(app).get(`/items/${idToTest}`).send();

    expect(result.status).toBe(200);
    expect(result.body).toBeInstanceOf(Object);
  });
  it('Deve retornar status 404 caso não exista um item com esse id',async () => {
    const items = await prisma.items.findMany();
    const ids = items.map((values : items) => values.id);
    const idToTest = ids[ids.length-1] + 1;

    const result = await supertest(app).get(`/items/${idToTest}`).send();
    expect(result.status).toBe(404);


  });
});
