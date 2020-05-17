const supertest = require("supertest");
const app = require("../../index");
describe("Testing the APIs", () => {
  it("tests our base url if it works", async () => {
    const response = await supertest(app).post('/fetchLikes');
	expect(response.status).toBe(200);
  });
});
