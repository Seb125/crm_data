const router = require("express").Router();
const axios = require("axios");
const Data = require("../models/Data.model");
const User = require("../models/User.model");
const Campaign = require("../models/Campaign.model");
const Detail = require("../models/Detail.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const cron = require("node-cron");
const XLSX = require('xlsx');
const path = require('path');



router.get("/readData", (req, res) => {

  function importNumbersDocument(filePath) {
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Assuming the first sheet is the one you want to import
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet);
    
    return rows;
  }
  const fileName = 'test.xlsx';
  const filePath = path.join(__dirname, fileName);
  
  const dataArray = importNumbersDocument(filePath);
  console.log(dataArray)
})


router.get("/authorize", (req, res) => {
  const authUrl = `https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCRM.modules.ALL,ZohoCRM.settings.ALL&client_id=${process.env.CLIENTID}&response_type=code&access_type=offline&redirect_uri=http://localhost:5005/callback`;
  res.redirect(authUrl);
});

router.get("/callback", async (req, res) => {
  const code = req.query.code;
  console.log(code);
  const tokenUrl = "https://accounts.zoho.com/oauth/v2/token";
  const params = new URLSearchParams({
    code,
    client_id: process.env.CLIENTID,
    client_secret: process.env.CLIENTSECRET,
    redirect_uri: process.env.REDIRECTURI,
    grant_type: "authorization_code",
  });

  try {
    const response = await axios.post(tokenUrl, params);

    console.log("all good so far");
    // Use the access token to make API requests to Zoho CRM
    // ...

    res.status(200).json({ response: response.data });
  } catch (error) {
    console.error("Error getting access token:", error.message);
    res.status(500).send("Error getting access token");
  }
});


router.get("/getData", isAuthenticated, async (req, res) => {
  try {
    const data = await Data.find();
    let campaignsData = await Campaign.find().populate("details");
    campaignsData = campaignsData.sort((a,b) => b.sent_time - a.sent_time)
    console.log(campaignsData.slice(0,10))
    res.status(200).json({data: data, campaigns: campaignsData})
  } catch (error) {
    console.log(error)
  }
});

router.post("/updateData", async (req, res) => {
  res.json({ message: "Scheduled task started!" });
  const moduleApiName = 'Contacts';

  const izErp = '((Thema:equals:ERP))';
  const izFi = '((Thema:equals:Fabrik))';
  const izIm = '((Thema:equals:Industrie%204.0))';

  const criteriaerp = '((Rolle_der_Person:equals:Anbieter)and(Thema:equals:ERP))';
  const criteriafi = '((Rolle_der_Person:equals:Anbieter)and((Thema:equals:Fabrik)or(Thema:equals:Industrie%204.0)))';
  const allBerater = '((Rolle_der_Person:equals:Berater))';
  const erpBerater = '((Rolle_der_Person:equals:Berater)and(Thema:equals:ERP))';
  const fiBerater = '((Rolle_der_Person:equals:Berater)and((Thema:equals:Fabrik)or(Thema:equals:Industrie%204.0)))';

  // get total number of contacts

  async function getNumbers(accessToken) {
    try {
      const url = `https://www.zohoapis.com/crm/v3/${moduleApiName}/actions/count`;
      const urlErp = `https://www.zohoapis.com/crm/v3/${moduleApiName}/actions/count?criteria=${izErp}`;
      const urlFi = `https://www.zohoapis.com/crm/v3/${moduleApiName}/actions/count?criteria=${izFi}`;
      const urlIm = `https://www.zohoapis.com/crm/v3/${moduleApiName}/actions/count?criteria=${izIm}`;
      const urlAnbErp = `https://www.zohoapis.com/crm/v3/${moduleApiName}/actions/count?criteria=${criteriaerp}`;
      const urlAnbFi = `https://www.zohoapis.com/crm/v3/${moduleApiName}/actions/count?criteria=${criteriafi}`;
      const urlBerater = `https://www.zohoapis.com/crm/v3/${moduleApiName}/actions/count?criteria=${allBerater}`;
      const urlErpBerater = `https://www.zohoapis.com/crm/v3/${moduleApiName}/actions/count?criteria=${erpBerater}`;
      const urlFiBerater = `https://www.zohoapis.com/crm/v3/${moduleApiName}/actions/count?criteria=${fiBerater}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    });
    return response;
  }
  const tokenUrl = "https://accounts.zoho.com/oauth/v2/token";
  const params = new URLSearchParams({
    refresh_token: process.env.REFRESH_TOKEN,
    client_id: process.env.CLIENTID,
    client_secret: process.env.CLIENTSECRET,
    grant_type: "refresh_token",
  });

  try {
    const response = await axios.post(tokenUrl, params);
    const accessToken = response.data.access_token;
    
    const responseAPI = await getData(accessToken);
    
    
    res.status(200).json({message: responseAPI.data.fields});
  } catch (error) {
    console.log(error)
  }
});

router.get("/update", async (req, res) => {
  // first I need to import the xlsx data
  function importNumbersDocument(filePath) {
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Assuming the first sheet is the one you want to import
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet);
    
    return rows;
  }
  const fileName = 'test.xlsx'; // this is my data
  const filePath = path.join(__dirname, fileName);
  // data is an array of objects with field to be updated
  const dataArray = importNumbersDocument(filePath);  

  const updateAccountData = async (accessToken, row) => {
    try {
      const response = await axios.put(`https://www.zohoapis.com/crm/v2/Accounts/${row.ID}`, 
      {
        data: [
          // empyt fields should not be updated 
          {
            ...(row.AccountName && { "Account_Name": row.AccountName }),
            ...(row.Strasse && { "Billing_Street": row.Strasse }),
            ...(row.PLZ && { "Billing_Code": row.PLZ.toString() }),
            ...(row.Ort && { "Billing_City": row.Ort }),
            ...(row.Website && { "Website": row.Website })

             // Specify the new name for the account
          }
        ]
      },
      {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    } catch (error) {
      console.log(error)
    }
  }
  const tokenUrl = "https://accounts.zoho.com/oauth/v2/token";
  const params = new URLSearchParams({
    refresh_token: process.env.REFRESH_TOKEN,
    client_id: process.env.CLIENTID,
    client_secret: process.env.CLIENTSECRET,
    grant_type: "refresh_token",
  });

  try {
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
      console.log(accessToken)
      const campParams = new URLSearchParams({
        resfmt: "JSON",
        sort: "desc",
        status: "sent",
        range: 10
      })
      const data = await getRecentCampaigns(accessToken, campParams);
      //const details = await getDetails(accessToken,"3zff55f4732d7273c40821a5488bbd68e6fb8dd03b8e2302b3594a67e8e23a5140" );
      //console.log(details.data)
      const sortedData = data.data.recent_campaigns.sort((a,b) => b.sent_time - a.sent_time).slice(0, 20);
      console.log("recent", sortedData);
      await Campaign.collection.drop();
      let myPromises = [];
      sortedData.forEach((campaign) => {
        myPromises.push(
            getDetails(accessToken, campaign.campaign_key)
            .then((response) => {
              if(response.data["campaign-reports"][0].emails_sent_count > 30) {
              return Detail.create({count_sent: response.data["campaign-reports"][0].emails_sent_count, 
                count_delivered: response.data["campaign-reports"][0].delivered_count, 
                percent_delivered: response.data["campaign-reports"][0].delivered_percent,
                percent_open: response.data["campaign-reports"][0].open_percent,
                unique_clicked_percent: response.data["campaign-reports"][0].unique_clicked_percent,
                clicksperopenrate: response.data["campaign-reports"][0].clicksperopenrate


              }) } else {
                return null;
              }
            })
            .then((detail) => {
              return Campaign.create({campaign_name: campaign.campaign_name, 
                sent_time: campaign.sent_time, 
                campaign_key: campaign.campaign_key, 
                campaign_preview: campaign.campaign_preview,
                details: detail._id
              })
            })
            .catch((error) => {
              console.log(error)
            })
          )
      });
      await Promise.all(myPromises);
      



      res.json({message: "Update Done"})

    } else {
      return res.status(401).json({ error: "Invalid access token or company Id" })
    }
  } catch (error) {
    console.log(error)
  }
});

module.exports = router;