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


  app.put('/api/v1/password/reset', async function (req, res) {
    try {
      const newPassword = req.body.newPassword;
      const email = (await getUser(req)).email;


      // Update the user's password in the database
      await db('se_project.users').where('email', email).update({
        password: newPassword
      });
  
      return res.status(200).send('Password reset successfully');
    } catch (e) {
      console.log(e.message);
      return res.status(400).send('Could not reset password');
    }
  });
  
  

  app.get('/api/v1/zones', async function (req, res) {
    try {
      const zones = await db.select('*').from("se_project.zones")
      return res.status(200).json(zones);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Could not get zones");
    }
  });

  app.post('/api/v1/payment/subscription', async function (req, res) {
    try {
      const { purchasedId, creditCardNumber, holderName, payedAmount, subType, zoneId } = req.body;
  
  
      let noOfTickets = 0;
      let deductionAmount = 0;
  
      if (subType === 'monthly' && zoneId === 1) {
        noOfTickets = 10;
        deductionAmount = 30;
      }
      else if (subType === 'quarterly' && zoneId === 1) {
        noOfTickets = 50;
        deductionAmount = 175;
      }
      else if (subType === 'annual' && zoneId === 1) {
        noOfTickets = 100;
        deductionAmount = 370;
      }
      else if (subType === 'monthly' && zoneId === 2) {
        noOfTickets = 10;
        deductionAmount = 50;
      }
      else if (subType === 'quarterly' && zoneId === 2) {
        noOfTickets = 50;
        deductionAmount = 270;
      }
      else if (subType === 'annual' && zoneId === 2) {
        noOfTickets = 100;
        deductionAmount = 550;
      }
      else if (subType === 'monthly' && zoneId === 3) {
        noOfTickets = 10;
        deductionAmount = 70;
      }
      else if (subType === 'quarterly' && zoneId === 3) {
        noOfTickets = 50;
        deductionAmount = 340;
      }
      else if (subType === 'annual' && zoneId === 3) {
        noOfTickets = 100;
        deductionAmount = 650;
      }
      else {
        return res.status(400).send("Invalid subscription type");
      }
  
      // Check if the user is a senio
      const userId = (await getUser(req)).userId;
  
      if ((await getUser(req)).isSenior) {
        deductionAmount = deductionAmount / 2; // Apply 50% discount
      }
  
      // Make sure that the paid amount is sufficient
      if (payedAmount < deductionAmount) {
        return res.status(400).send('Insufficient payment amount');
      }
  
      const remainingAmount = payedAmount - deductionAmount;
  
      // Create the subscription record
      const subscription = await db('se_project.subsription').insert({
        subType,
        zoneId,
        userId,
        noOfTickets
      });
  
      // Create the transaction record
      const transaction = await db('se_project.transactions').insert({
        amount: deductionAmount,
        userId,
        purchasedId
      });
  
      return res.status(200).send({
        subscriptionId: subscription.id,
        remainingAmount,
        message: 'Subscription Successful'
      });
    } catch (e) {
      console.log(e.message);
      return res.status(400).send('Could not create subscription');
    }
  });
  
};
