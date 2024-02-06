const router = require("express").Router();
const axios = require('axios');
const Data = require("../models/Data.model")
const { isAuthenticated } = require("../middleware/jwt.middleware");
const cron = require('node-cron');

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

router.get("/getData" , isAuthenticated, async (req, res) => {
  try {
    const data = await Data.find();
    res.status(200).json({data: data})
  } catch (error) {
    console.log(error)
  }
})

cron.schedule('15 13 * * *', async () => {

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
        console.error('Error fetching records:', error);
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

    const response = await axios.post(tokenUrl, params);
    const accessToken = response.data.access_token;
    const erpResponse  = await getAllErpRecords(accessToken);
    const fiResponse = await getAllFiRecords(accessToken);

    await Data.create({erp: erpResponse.length, fi: fiResponse.length})

    console.log('Scheduled task completed successfully.');
  } catch (error) {
    console.log(error)
  }
});
 
module.exports = router;
