const mongoose = require("mongoose");
const request = require("supertest");

const authService = require('../services/auth.service');
const userService = require('../services/user.services');

const app = require('../app');
// require('dotenv').config();

// Connecting to MongoDB before each test
beforeEach(async ()=> {
  await mongoose.connect(process.env.MONGODB_URI)
  .then(
    () => {console.log("Connection to MongoDB established for Jest")},
    err => { console.log("Failed to connect to MongoDB for Jest", err) }
  );
});

// Close connection to MongoDB
afterEach(async ()=>{
  await mongoose.connection.close();
})

describe("Requests for /api/users", ()=>{

  let token;

  beforeAll(()=>{
    user = {
      username: "admin",
      email: "admin@aueb.gr",
      roles: ["EDITOR", "READER","ADMIN"]
    };
    token = authService.generateAccessToken(user);
  });

  it('GET Returns all users', async ()=>{
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200)
    expect(res.body.status).toBeTruthy();
    expect(res.body.data.length).toBeGreaterThan(0);
  }, 50000);

  it("POST Creates a user", async ()=>{
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        'username':'test5',
        'password':'12345',
        'name':'test5 name',
        'surname': 'test5 surname',
        'email':'test5@aueb.gr',
        'address': {
          'area':'area1',
          'road':'road5'
        }
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBeTruthy();
  }, 50000)

  it("POST Creates a user with same username", async()=>{
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'test5',
        password:'12345',
        name: 'new name',
        surname:'new surname',
        email:'new@aueb.gr',
        address: {
          area: 'xxxx',
          road: 'yyyy'
        }
      })

      expect(res.statusCode).toBe(400);
      expect(res.body.status).not.toBeTruthy()
  });

  it("Post Creates a user with same email", async() => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        username:'test6',
        password: '12345',
        name:'name test6',
        surname:'surname test6',
        email:'test5@aueb.gr',
        address:{
          area:'area23',
          road:'road23'
        }
      })

      expect(res.statusCode).toBe(400);
      expect(res.body.status).not.toBeTruthy();
  });

  it("POST Creates a user with empty surname, name, password", async()=>{
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'test6',
        password:'',
        name:'',
        surname:'',
        email:'test6@aueb.gr',
        address: {
          area: 'area23',
          road: 'road23'
        }
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).not.toBeTruthy();
  })
});


describe("Requests for /api/users/:username", () => {
  let token 

  beforeAll(()=>{
    user = {
      username: "lakis",
      email: "lalakis@aueb.gr",
      roles: ["EDITOR", "READER","ADMIN"]
    };
    token = authService.generateAccessToken(user);
  });

  it("Get returns specific user", async()=>{
    
    const result = await userService.findLastInsertedUser();
    
    const res = await request(app)
      .get('/api/users/'+result.username)
      .set('Authorization', `Bearer ${token}`); 
    
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBeTruthy();
    expect(res.body.data.username).toBe(result.username);
    expect(res.body.data.email).toBe(result.email);
  });

  it("Update a user", async ()=>{
    const result = await userService.findLastInsertedUser();

    const res = await request(app)
      .patch('/api/users/' + result.username)
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: result.username,
        name: "new updated name",
        surname: "new updated surname",
        email: "new@aueb.gr",
        address: {
          area:"area50",
          road:result.address.road
        }
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBeTruthy();
  });

  it("DELETE delete a user", async ()=>{
    const result = await userService.findLastInsertedUser();

    const res = await request(app)
      .delete('/api/users/' + result.username)
      .set('Authorization', `Bearer ${token}` );

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBeTruthy();
  })
})
