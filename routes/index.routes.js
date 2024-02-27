const router = require("express").Router();
const axios = require('axios');
const Data = require("../models/Data.model");
const User = require("../models/User.model");
const Campaign = require("../models/Campaign.model");
const Detail = require("../models/Detail.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const cron = require('node-cron');

router.get("/", (req, res, next) => {
  res.json("All good in here");
});


router.get('/authorize', (req, res) => {
  const authUrl = `https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCRM.modules.READ,ZohoCampaigns.campaign.READ&client_id=${process.env.CLIENTID}&response_type=code&access_type=offline&redirect_uri=https://crm-statistics.adaptable.app/callback`;
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


router.get("/getData", isAuthenticated, async (req, res) => {
  try {
    const data = await Data.find();
    const campaignsData = await Campaign.find().populate("details");

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
          'Authorization': `Zoho-oauthtoken ${accessToken}`
        }
      });
      const responseErp = await axios.get(urlErp, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`
        }
      });
      const responseFi = await axios.get(urlFi, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`
        }
      });
      const responseIm = await axios.get(urlIm, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`
        }
      });
      const responseAnbErp = await axios.get(urlAnbErp, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`
        }
      });
      const responseAnbFi = await axios.get(urlAnbFi, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`
        }
      });
      const responseBerater = await axios.get(urlBerater, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`
        }
      });
      const responseErpBerater = await axios.get(urlErpBerater, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`
        }
      });
      const responseFiBerater = await axios.get(urlFiBerater, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`
        }
      });
      return [response.data.count, responseErp.data.count, responseFi.data.count, responseIm.data.count, responseAnbErp.data.count, 
        responseAnbFi.data.count, responseBerater.data.count, responseErpBerater.data.count, responseFiBerater.data.count];
    } catch (error) {
      console.log(error)
    }
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
     
      const allResponse = await getNumbers(accessToken);
      await Data.create({all: allResponse[0], erp: allResponse[1], fi: allResponse[2], im: allResponse[3], anbErp: allResponse[4],
      anbFiIm: allResponse[5], berater: allResponse[6], beraterErp: allResponse[7], beraterFiIm: allResponse[8]})

      console.log(allResponse);

    } else {
      return res.status(401).json({ error: "Invalid access token or company Id" })
    }
  } catch (error) {
    console.log(error)
  }
});

router.post("/campaigns", async (req, res) => {
  //res.json({ message: "Scheduled task started!" });
  async function getRecentCampaigns (access_Token, campParams) {
    const url = "https://campaigns.zoho.com/api/v1.1/recentcampaigns";
    const responseRecentCampaigns = await axios.get(url, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${access_Token}`
      },
      params: campParams
    });

    return responseRecentCampaigns;

  }
  async function getDetails(access_Token, campaignKey) {
    const url = "https://campaigns.zoho.com/api/v1.1/getcampaigndetails";
    const reponseCampDetails = await axios.get(url, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${access_Token}`
      },
      params: {
        resfmt: "JSON",
        campaignkey: campaignKey
      }
    });
    return reponseCampDetails;
  }
  const tokenUrl = 'https://accounts.zoho.com/oauth/v2/token';
  const params = new URLSearchParams({
    refresh_token: process.env.REFRESH_TOKEN,
    client_id: process.env.CLIENTID,
    client_secret: process.env.CLIENTSECRET,
    grant_type: 'refresh_token',
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
})
 
module.exports = router;
