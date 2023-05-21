const { isEmpty } = require("lodash");
const { v4 } = require("uuid");
const db = require("../../connectors/db");
const roles = require("../../constants/roles");
const {getSessionToken}=require('../../utils/session')
const getUser = async function (req) {
  const sessionToken = getSessionToken(req);
  if (!sessionToken) {
    return res.status(301).redirect("/");
  }
  console.log("hi",sessionToken);
  const user = await db
    .select("*")
    .from("se_project.sessions")
    .where("token", sessionToken)
    .innerJoin(
      "se_project.users",
      "se_project.sessions.userId",
      "se_project.users.id"
    )
    .innerJoin(
      "se_project.roles",
      "se_project.users.roleId",
      "se_project.roles.id"
    )
   .first();

  console.log("user =>", user);
  user.isNormal = user.roleId === roles.user;
  user.isAdmin = user.roleId === roles.admin;
  user.isSenior = user.roleId === roles.senior;
  return user;
};

module.exports = function (app) {
  // example
  app.put("/users", async function (req, res) {
    try {
       const user = await getUser(req);
     // const {userId}=req.body
     console.log("hiiiiiiiiiii");
      const users = await db.select('*').from("se_project.users")
        
      return res.status(200).json(users);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Could not get users");
    }
  });
 

  

app.post("/api/v1/refund/:ticketId", async function (req, res) {
  const ticketId = req.params.ticketId;
  const ticketQuery = await db
      .select("*")
      .from("se_project.tickets")
      .where("id", ticketId)
      .first();
    if (isEmpty(ticketQuery)) {
      return res.status(400).send("This ticket doesn't exist in the first place to be refunded");
    }
    else
    {
      db.del().where('id', '==', ticketId)
    }
});


// doesn't want to work for some reason
app.post("/api/v1/senior/request", async function(req, res) {
  const status = "pending";
  const userId = getUser(req).userId;
  const {nationalId} = req.body;
  const newRequest = {
    status,
    userId,
    nationalId
  }
  try {
    const request = await db("se_project.requests").insert(newRequest).returning("*");
    return res.status(200).json(request);
  }
  catch (e) {
    console.log(e.message);
    return res.status(400).send("Could not register request");
  }
});

app.put("/api/v1/ride/simulate", async function(req, res) {
  const {origin, destination, tripDate } = req.body;
  const userId = getUser(req).userId;
  try
  {
    const newRide = await db("se_project.rides")
    .where("origin", origin)
    .andWhere("destination", destination)
    .andWhere("tripDate", tripDate)
    .andWhere(userId, userId)
    .update("status", "completed").returning("*");
    return res.status(200).json(newRide);
  }
  catch (e) {
    console.log(e.message);
    return res.status(400).send("Could not simulate ride");
  }





  
};
