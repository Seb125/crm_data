const router = require("express").Router();
const axios = require("axios");
const { google } = require('google-auth-library');
const path = require('path');
const ERP = require("../models/ERP.model");

const { isAuthenticated } = require("../middleware/jwt.middleware");

// Imports the Google Analytics Data API client library.
const { BetaAnalyticsDataClient } = require("@google-analytics/data");
//ERP GA4 Property ID 358586713
const propertyId = "358586713";


router.get("/webreport", async (req, res, next) => {
 
const property = '358586713'
/**
 *  The dimensions requested and displayed.
 */
const dimensions = [{
  name: 'pagePath',
}]
/**
 *  The metrics requested and displayed.
 */
const metrics = [{
  name: 'screenPageViews',
},
{
name: 'activeUsers'
},
{
name: 'bounceRate'
},
]

const {BetaAnalyticsDataClient} = require('@google-analytics/data').v1beta;

// Instantiates a client
const dataClient = new BetaAnalyticsDataClient();

async function callRunReport() {
  // Construct request
  const request = {
    property: `properties/${property}`,
  dateRanges: [
    {
      startDate: '2024-01-01',
      endDate: 'today',
    },
  ],
  dimensions: dimensions,
  metrics: metrics,
  };

  const serchTerm =   {
    property: `properties/${property}`,
  dateRanges: [
    {
      startDate: '2024-01-01',
      endDate: 'today',
    },
  ],
  dimensions: [
  {
    name: "searchTerm"
    }],
  metrics: [
    {
      name: "searchResultView"
      }],
  };


  // Run request
  const response = await dataClient.runReport(request);
  //const responseSearch = await dataClient.runReport(serchTerm);

  const currentMonth = await ERP.create({});
  
  const myPromises = response[0].rows.map((row) => {
    return ERP.findByIdAndUpdate({_id: currentMonth._id}, {$push: {pagePath_screenPageViews: {pagePath: row.dimensionValues[0].value, pageViews: row.metricValues[0].value, activeUsers: row.metricValues[1].value, bounceRate: row.metricValues[2].value}}})
  });
  await Promise.all(myPromises);
  //console.log(response[0].rows[1]);
}

try {
  callRunReport();
  res.status(200).json({messahe: "all good"})
} catch (error) {
  console.log(error)
}

});

router.get("/erp",  async (req, res) => {
  try {
    const data = await ERP.find();
    const sortedData =  data[0].pagePath_screenPageViews.sort((a, b) => b.pageViews - a.pageViews);
    console.log(sortedData)
    res.status(200).json({data: data});
  } catch (error) {
    console.log(error)
  }
})

module.exports = router;
