const router = require("express").Router();
const axios = require('axios');
const Data = require("../models/Data.model")
const { isAuthenticated } = require("../middleware/jwt.middleware");
const cron = require('node-cron');

router.get("/", (req, res, next) => {
  res.json("All good in here");
});


router.get('/authorize', (req, res) => {
  const authUrl = `https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCRM.modules.READ,ZohoCRM.settings.all&client_id=1000.IR0X01MW4WTWRAKARXJ35O7J9ZUZGP&response_type=code&access_type=offline&redirect_uri=https://crm-statistics.adaptable.app/callback`;
  res.redirect(authUrl);
});

router.get('/callback', async (req, res) => {
  const code = req.query.code;
  console.log(code)
  const tokenUrl = 'https://accounts.zoho.com/oauth/v2/token';
  const params = new URLSearchParams({
    code,
    client_id: process.env.CLIENTID,
    client_secret: process.env.CLIENTSECRET,
    redirect_uri: process.env.REDIRECTURI,
    grant_type: 'authorization_code',
  });

  try {
    const response = await axios.post(tokenUrl, params);
    const accessToken = response.data.access_token;
    console.log("all good so far")
    // Use the access token to make API requests to Zoho CRM
    // ...

    res.send(response);
  } catch (error) {
    console.error('Error getting access token:', error.message);
    res.status(500).send('Error getting access token');
  }
});


router.get("/getData" , isAuthenticated, async (req, res) => {
  try {
    const data = await Data.find();
    res.status(200).json({data: data})
  } catch (error) {
    console.log(error)
  }
})
 
module.exports = router;
