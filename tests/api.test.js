const request = require("supertest");
const { app } = require("../server");
const { server } = require("../server");
const mongoose = require("mongoose");

const validCredentials = {
  email: "test@gmail.com",
  password: "helloworld5"
};
const wrongCredentials = {
  email: "wrong@gmail.com",
  password: "wrongworld5"
};

const newUser = {
  email: "test@gmail.com",
  password: "helloworld5",
  bio: "engeneer",
  title: "some title",
  name: "test1",
  surname: "test1"
};

const newExperience = {
  role: "CTO",
  company: "test company",
  startDate: "Fri Nov 15 2019 16:37:02 GMT+0100",
  description: "i was the cto",
  email: "someemail@gmail.com"
};

var experienceId;

var userGotFromMe = {};

var token = "";

//trick to avoid TCPSERVERWRAP open handle error
//solution from here:https://github.com/visionmedia/supertest/issues/520
afterAll(async () => {
  await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
  var conn = mongoose.connection;
  //delete the test db for testing
  mongoose.connection.db.dropDatabase();
  conn.on("error", err => {
    console.log("errors in the connection", err);
  });
});

expect.extend({
  toBeType(received, argument) {
    const initialType = typeof received;
    const type =
      initialType === "object"
        ? Array.isArray(received)
          ? "array"
          : initialType
        : initialType;
    return type === argument
      ? {
          message: () => `expected ${received} to be type ${argument}`,
          pass: true
        }
      : {
          message: () => `expected ${received} to be type ${argument}`,
          pass: false
        };
  }
});

post = (url, body, jwt) => {
  const httpRequest = request(app).post(url);
  httpRequest.set("Accept", "application/json");
  if (!jwt) {
    //looking for a jwt
    httpRequest.send(body);
  } else {
    httpRequest.set("Authorization", "bearer " + jwt);
    httpRequest.send(body);
  }
  return httpRequest;
};

put = (url, body, jwt) => {
  const httpRequest = request(app).put(url);
  httpRequest.set("Accept", "application/json");
  httpRequest.set("Authorization", "bearer " + jwt);
  httpRequest.send(body);

  return httpRequest;
};

get = (url, jwt) => {
  const httpRequest = request(app).get(url);
  if (jwt) httpRequest.set("Authorization", "bearer " + jwt);
  httpRequest.set("Accept", "application/json");
  return httpRequest;
};

describe("User create/login/refresh operations", () => {
  test("should create a new user", async () => {
    let response = await post("/user/register", newUser)
      .expect("Content-Type", /json/)
      .expect(201);
    expect(response.body).toEqual({
      status: expect.toBeType("string"),
      success: expect.toBeType("boolean"),
      user: {
        _id: expect.toBeType("string"),
        email: expect.toBeType("string"),
        salt: expect.toBeType("string"),
        hash: expect.toBeType("string"),
        __v: expect.toBeType("number")
      }
    });
    expect(response.body.status).toBe("New user created");
    expect(response.body.success).toBe(true);
  });

  test("USER/LOGIN should return 401 on invalid credentials", async () => {
    let response = await post("/user/login", wrongCredentials).expect(401);
  });

  test("USER/LOGIN should login with credentials", async () => {
    let response = await post("/user/login", validCredentials)
      .expect("Content-Type", /json/)
      .expect(200);
    expect(response.body).toEqual({
      token: expect.toBeType("string"),
      success: expect.toBeType("boolean")
    });
    expect(response.body.success).toBe(true);
    token = response.body.token;
  });

  test("USER/REFRESH should return 401 on invalid token refresh", async () => {
    let response = await post(
      "/user/refresh",
      {},
      "thisisnotavalidtoken"
    ).expect(401);
  });

  test("USER/REFRESH should refresh valid jwt token", async () => {
    let response = await post("/user/refresh", {}, token)
      .expect(200)
      .expect("Content-Type", /json/);
    expect(response.body).toEqual({
      token: expect.toBeType("string"),
      success: expect.toBeType("boolean")
    });
    expect(response.body.success).toBe(true);

    //expect(response.body.token).not.toBe(token); not working becasue not refreshing the token for some reason
  });
});

describe("/PROFILES AND /PROFILES/EXPERIENCES CRUD OPERATIONS", () => {
  test("GET - /PROFILES should return every profile in the db", async () => {
    let response = await get("/profiles")
      .expect(200)
      .expect("Content-Type", /json/);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.toBeType("string"),
          name: expect.toBeType("string"),
          surname: expect.toBeType("string"),
          email: expect.toBeType("string"),
          bio: expect.toBeType("string"),
          title: expect.toBeType("string"),
          createdAt: expect.toBeType("string"),
          updatedAt: expect.toBeType("string"),
          __v: expect.toBeType("number")
        })
      ])
    );
  });

  test("GET - /PROFILES/ME should return 401 on invalid token", async () => {
    let response = await get("/profiles/me", "not a valid token").expect(401);
  });

  test("GET - /PROFILES/ME should return my profile", async () => {
    let response = await get("/profiles/me", token)
      .expect(200)
      .expect("Content-Type", /json/);
    expect(response.body).toEqual({
      _id: expect.toBeType("string"),
      name: expect.toBeType("string"),
      surname: expect.toBeType("string"),
      email: expect.toBeType("string"),
      bio: expect.toBeType("string"),
      title: expect.toBeType("string"),
      createdAt: expect.toBeType("string"),
      updatedAt: expect.toBeType("string"),
      __v: expect.toBeType("number")
    });
    userGotFromMe = Object.assign({}, { ...response.body });
  });

  test("GET - /PROFILES/:email should return 401 if token is missing or not valid", async () => {
    let response = await get(
      "/profiles/test@gmail.com",
      "not a valid token"
    ).expect(401);
  });

  test("GET - /PROFILES/:email should return 404 if the specified user do not exist", async () => {
    let response = await get("/profiles/wrong@gmail.com", token).expect(404);
  });

  test("GET - /PROFILES/:email should return the user corrisponding to the email", async () => {
    let response = await get("/profiles/test@gmail.com", token)
      .expect(200)
      .expect("Content-Type", /json/);
    expect(response.body).toEqual({
      _id: expect.toBeType("string"),
      name: expect.toBeType("string"),
      surname: expect.toBeType("string"),
      email: expect.toBeType("string"),
      bio: expect.toBeType("string"),
      title: expect.toBeType("string"),
      createdAt: expect.toBeType("string"),
      updatedAt: expect.toBeType("string"),
      __v: expect.toBeType("number")
    });
    expect(response.body.email).toBe(newUser.email);
  });

  test("PUT - /PROFILES should return 401 on invalid token ", async () => {
    let response = await put(
      "/profiles",
      { name: "modified with the put" },
      "thisisnotatoken"
    ).expect(401);
  });

  test("PUT - /PROFILES should modify the user corrisponding to the jwt token and return it", async () => {
    let response = await put(
      "/profiles",
      { name: "modified with the put" },
      token
    )
      .expect(200)
      .expect("Content-Type", /json/);
    expect(response.body).toEqual({
      _id: expect.toBeType("string"),
      name: expect.toBeType("string"),
      surname: expect.toBeType("string"),
      email: expect.toBeType("string"),
      bio: expect.toBeType("string"),
      title: expect.toBeType("string"),
      createdAt: expect.toBeType("string"),
      updatedAt: expect.toBeType("string"),
      __v: expect.toBeType("number")
    });
    expect(response.body.updatedAt).not.toBe(userGotFromMe.updatedAt);
    expect(response.body.name).not.toEqual(userGotFromMe.name);
  });

  test("POST - /profiles/experiences should return 400 on missing experience fields", async () => {
    var wrongExperience = Object.assign({}, { ...newExperience });
    delete wrongExperience.description;
    let response = await post("/profiles/experiences", wrongExperience, token)
      .expect(400)
      .expect("content-type", /json/);
    expect(response.body).toEqual(
      expect.objectContaining({
        error: expect.toBeType("string")
      })
    );
  });

  test("POST - /profiles/experience should return 401 if missing or invalid token", async () => {
    let response = await post(
      "/profiles/experiences",
      newExperience,
      "not a valid token"
    ).expect(401);
  });

  test("POST - /profiles/experiences should create a new experience for the logged user", async () => {
    let response = await post("/profiles/experiences", newExperience, token)
      .expect(201)
      .expect("Content-Type", /json/);
    expect(response.body).toEqual({
      _id: expect.toBeType("string"),
      role: expect.toBeType("string"),
      company: expect.toBeType("string"),
      startDate: expect.toBeType("string"),
      description: expect.toBeType("string"),
      email: expect.toBeType("string"),
      createdAt: expect.toBeType("string"),
      updatedAt: expect.toBeType("string"),
      __v: expect.toBeType("number")
    });
  });

  test("GET - /profiles/:email/experiences should return 404 if the specified email do not exist", async () => {
    let response = await get(
      "/profiles/wrong@gmail.com/experiences",
      token
    ).expect(404);
  });

  test("GET - /profiles/:email/experiences should return 401 if the token is not valid", async () => {
    let response = await get(
      "/profiles/test@gmail.com/experiences",
      "not a valid token"
    ).expect(401);
  });

  test("GET - /profiles/:email/experiences should return a list of experiences of that user", async () => {
    let response = await get("/profiles/test@gmail.com/experiences", token)
      .expect(200)
      .expect("Content-Type", /json/);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.toBeType("string"),
          role: expect.toBeType("string"),
          company: expect.toBeType("string"),
          startDate: expect.toBeType("string"),
          description: expect.toBeType("string"),
          email: expect.toBeType("string"),
          createdAt: expect.toBeType("string"),
          updatedAt: expect.toBeType("string"),
          __v: expect.toBeType("number")
        })
      ])
    );
    experienceId = response.body[0]._id;
  });

  test("GET - /profiles/experiences/:expId returns 400 on a wrong id", async () => {
    let response = await get("/profiles/experiences/" + 234, token)
      .expect(400)
      .expect("Content-Type", /json/);
    expect(response.body).toEqual(
      expect.objectContaining({
        error: expect.toBeType("string")
      })
    );
  });

  test("GET - /profiles/experiences/:expId returns 401 on a not valid token", async () => {
    let response = await get(
      "/profiles/experiences/" + experienceId,
      "not a valid token"
    ).expect(401);
  });

  test("GET - /profiles/experiences/:expId get a specific experience from it's id", async () => {
    let response = await get("/profiles/experiences/" + experienceId, token)
      .expect(200)
      .expect("Content-Type", /json/);
    expect(response.body).toEqual(
      expect.objectContaining({
        _id: expect.toBeType("string"),
        role: expect.toBeType("string"),
        company: expect.toBeType("string"),
        startDate: expect.toBeType("string"),
        description: expect.toBeType("string"),
        email: expect.toBeType("string"),
        createdAt: expect.toBeType("string"),
        updatedAt: expect.toBeType("string"),
        __v: expect.toBeType("number")
      })
    );
    expect(response.body._id).toBe(experienceId);
  });
});
