Zoho CRM Campaigns Analysis Interface  <br>

Project Overview  <br>
This project serves as an interface between your application and Zoho CRM and Zoho Campaigns APIs. It provides functionalities to authorize users through OAuth2.0, fetch CRM data, fetch campaign data, and update your database with CRM and campaigns data.

Getting Started  <br>
To get started with this project, follow these steps:

BACKEND: 
Clone this repository: git clone <repository_url> <br>
Install dependencies: npm install  <br>
Set up environment variables:  <br>
CLIENTID: Your Zoho CRM client ID  <br>
CLIENTSECRET: Your Zoho CRM client secret  <br>
REFRESH_TOKEN: Your Zoho CRM refresh token  <br>
REDIRECTURI: Your redirect URI for OAuth2.0 authorization  <br>
Start the server: npm start  <br>

FRONTEND   <br>
https://github.com/Seb125/crm_data_client  <br>
Clone the repository: git clone <repository_url>  <br>
Install dependencies: npm install  <br>
Start the server: npm start  <br>


Usage  <br>
Endpoints  <br>
/authorize: Initiates the OAuth2.0 authorization process for Zoho CRM.  <br>
/callback: Callback URL after successful authorization. Retrieves access token.  <br>
/getCrmData: Retrieves CRM data.  <br>
/getCampaignsData: Retrieves campaigns data.  <br>
/updateData: Updates the database with CRM data.  <br>
/campaigns: Updates the database with the 20 most recently sent campaigns.  <br>  <br>
Middleware  <br>
isAuthenticated: Middleware function to ensure user authentication.  <br>
Frontend Integration <br>  <br>
Campaigns Component  <br>
The Campaigns component provides a user interface to interact with campaign data. It displays a table of campaign information and allows users to generate plots based on selected campaigns.
 <br>  <br>
CRM Component  <br>
The CRM component displays CRM data in tabular format categorized by different criteria.  <br>
 <br>
Dependencies  <br>
Express.js: Web framework for Node.js.  <br>
Axios: HTTP client for making requests to external APIs.  <br>
Node-cron: Library for scheduling tasks.  <br>
Mongoose: MongoDB object modeling tool.
React: Frontend library for building user interfaces.
Chart.js: JavaScript charting library.
html2canvas: Library to capture screenshots of HTML elements.
