const router = require("express").Router();
const axios = require('axios');
const Data = require("../models/Data.model");
const User = require("../models/User.model");
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
    
    console.log("all good so far")
    // Use the access token to make API requests to Zoho CRM
    // ...

    res.status(200).json({response: response.data });
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
});

router.post("/updateData", async (req, res) => {
  console.log("Updating is starting")
  const moduleApiName = 'Contacts';
  const criteriaerp = '((Rolle_der_Person:equals:Anbieter)and(Thema:equals:ERP))';
  const criteriafi = '((Rolle_der_Person:equals:Anbieter)and(Thema:equals:Fabrik))';


  async function getAllErpRecords(accessToken) {
    const url = `https://www.zohoapis.com/crm/v3/${moduleApiName}/search?criteria=${criteriaerp}`;
    let allRecords = [];
    let nextPage = 1;
  
    while (true) {
      try {
        const response = await axios.get(`${url}&page=${nextPage}`, {
          headers: {
            'Authorization': `Zoho-oauthtoken ${accessToken}`
          }
        });
  
        const records = response.data.data;
        allRecords = allRecords.concat(records);
  
        // Check if there are more records/pages
        if (response.data.info.more_records) {
          nextPage++;
        } else {
          break; // No more records, exit the loop
        }
      } catch (error) {
        console.error('Error fetching records:', error);
        break;
      }
    }
  
    return allRecords;
  }
  async function getAllFiRecords(accessToken) {
    const url = `https://www.zohoapis.com/crm/v3/${moduleApiName}/search?criteria=${criteriafi}`;
    let allRecords = [];
    let nextPage = 1;
  
    while (true) {
      try {
        const response = await axios.get(`${url}&page=${nextPage}`, {
          headers: {
            'Authorization': `Zoho-oauthtoken ${accessToken}`
          }
        });
  
        const records = response.data.data;
        allRecords = allRecords.concat(records);
  
        // Check if there are more records/pages
        if (response.data.info.more_records) {
          nextPage++;
        } else {
          break; // No more records, exit the loop
        }
      } catch (error) {
        console.error('Cron Error fetching records:', error);
        break;
      }
    }
  
    return allRecords;
  }

  const tokenUrl = 'https://accounts.zoho.com/oauth/v2/token';
  const params = new URLSearchParams({
    refresh_token: process.env.REFRESH_TOKEN,
    client_id: process.env.CLIENTID,
    client_secret: process.env.CLIENTSECRET,
    grant_type: 'refresh_token',
  });

  try {

    // first check if the access token is valid

    const { dataToken } = req.body;

    if (!dataToken) {
      return res.status(401).json({ error: 'Access token is missing.' });
    }

    // Check if access token matches with a company_id
    // For testing create company Document in database: Access Token: access, company_id: 123456
    const userDocument = await User.findOne({
      dataToken: dataToken
    });

    if (userDocument) {
      const response = await axios.post(tokenUrl, params);
      const accessToken = response.data.access_token;
      const erpResponse  = await getAllErpRecords(accessToken);
      const fiResponse = await getAllFiRecords(accessToken);

      await Data.create({erp: erpResponse.length, fi: fiResponse.length})

      res.json({ message: "Scheduled task completed successfully" });
    } else {
      return res.status(401).json({ error: "Invalid access token or company Id" })
    }
  } catch (error) {
    console.log(error)
  }
});
 
module.exports = router;
