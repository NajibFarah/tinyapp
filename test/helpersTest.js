const { assert } = require("chai");

const { getUserByEmail } = require("../helpers.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  NajibFarah: {
    id: "NajibFarah",
    email: "muhammed.najib.farah@gmail.com",
    password: bcrypt.hashSync("najib", 10),
  },
};

describe("getUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedOutput);
  });

  it("should return undefined", function () {
    const user = getUserByEmail("fake@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});
