const schedule = require("node-schedule");

const job = schedule.scheduleJob("0 13 * * *", function () {
  // update CRM data
  console.log("Scheduled Job started")
  const moduleApiName = "Contacts";

  const izErp = "((Thema:equals:ERP))";
  const izFi = "((Thema:equals:Fabrik))";
  const izIm = "((Thema:equals:Industrie%204.0))";

  const criteriaerp =
    "((Rolle_der_Person:equals:Anbieter)and(Thema:equals:ERP))";
  const criteriafi =
    "((Rolle_der_Person:equals:Anbieter)and((Thema:equals:Fabrik)or(Thema:equals:Industrie%204.0)))";
  const allBerater = "((Rolle_der_Person:equals:Berater))";
  const erpBerater = "((Rolle_der_Person:equals:Berater)and(Thema:equals:ERP))";
  const fiBerater =
    "((Rolle_der_Person:equals:Berater)and((Thema:equals:Fabrik)or(Thema:equals:Industrie%204.0)))";

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
      const responseErp = await axios.get(urlErp, {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
      });
      const responseFi = await axios.get(urlFi, {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
      });
      const responseIm = await axios.get(urlIm, {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
      });
      const responseAnbErp = await axios.get(urlAnbErp, {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
      });
      const responseAnbFi = await axios.get(urlAnbFi, {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
      });
      const responseBerater = await axios.get(urlBerater, {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
      });
      const responseErpBerater = await axios.get(urlErpBerater, {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
      });
      const responseFiBerater = await axios.get(urlFiBerater, {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
      });
      return [
        response.data.count,
        responseErp.data.count,
        responseFi.data.count,
        responseIm.data.count,
        responseAnbErp.data.count,
        responseAnbFi.data.count,
        responseBerater.data.count,
        responseErpBerater.data.count,
        responseFiBerater.data.count,
      ];
    } catch (error) {
      console.log(error);
    }
  }

  const tokenUrl = "https://accounts.zoho.com/oauth/v2/token";
  const params = new URLSearchParams({
    refresh_token: process.env.REFRESH_TOKEN,
    client_id: process.env.CLIENTID,
    client_secret: process.env.CLIENTSECRET,
    grant_type: "refresh_token",
  });

  const getData = async (dataToken, tokenUrl, params) => {
    try {
      const userDocument = await User.findOne({
        dataToken: dataToken,
      });

      if (userDocument) {
        const response = await axios.post(tokenUrl, params);
        const accessToken = response.data.access_token;

        const allResponse = await getNumbers(accessToken);
        await Data.create({
          all: allResponse[0],
          erp: allResponse[1],
          fi: allResponse[2],
          im: allResponse[3],
          anbErp: allResponse[4],
          anbFiIm: allResponse[5],
          berater: allResponse[6],
          beraterErp: allResponse[7],
          beraterFiIm: allResponse[8],
        });

        console.log(allResponse);
      } else {
        return res
          .status(401)
          .json({ error: "Invalid access token or company Id" });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // first check if the access token is valid

  const { dataToken } = req.body;

  if (!dataToken) {
    return res.status(401).json({ error: "Access token is missing." });
  }

  // Check if access token matches with a company_id
  getData(dataToken, tokenUrl, params);
});
