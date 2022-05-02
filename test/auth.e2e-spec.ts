import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication system', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles a signup request', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({email: 'ila@ilu.com', password: '1234'})
      .expect(201)
      .then((res) => {
          const { id, email} = res.body;
          expect(id).toBeDefined();
          expect(email).toEqual(email);
      })
  });

  it('signup as a new user then get the currently logged in user', async () => {
    const email = 'ili@ili.com';

    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: '123'})
      .expect(201)

    const cookie = res.get('Set-Cookie');
    
    // console.log(await request(app.getHttpServer()).get('/auth/whoami').set('Cookie',cookie));

    return await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200)
     // .then((res) => console.log(res))

    

    // expect(body.email).toEqual(email);
  });
});
