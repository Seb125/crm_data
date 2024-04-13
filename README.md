Zoho CRM Campaigns Analysis Interface

Project Overview
This project serves as an interface between your application and Zoho CRM and Zoho Campaigns APIs. It provides functionalities to authorize users through OAuth2.0, fetch CRM data, fetch campaign data, and update your database with CRM and campaigns data.

Getting Started
To get started with this project, follow these steps:

BACKEND: 
Clone this repository: git clone <repository_url>
Install dependencies: npm install
Set up environment variables:
CLIENTID: Your Zoho CRM client ID
CLIENTSECRET: Your Zoho CRM client secret
REFRESH_TOKEN: Your Zoho CRM refresh token
REDIRECTURI: Your redirect URI for OAuth2.0 authorization
Start the server: npm start

FRONTEND 
https://github.com/Seb125/crm_data_client
Clone the repository: git clone <repository_url>
Install dependencies: npm install
Start the server: npm start


Usage
Endpoints
/authorize: Initiates the OAuth2.0 authorization process for Zoho CRM.
/callback: Callback URL after successful authorization. Retrieves access token.
/getCrmData: Retrieves CRM data.
/getCampaignsData: Retrieves campaigns data.
/updateData: Updates the database with CRM data.
/campaigns: Updates the database with the 20 most recently sent campaigns.
Middleware
isAuthenticated: Middleware function to ensure user authentication.
Frontend Integration
Campaigns Component
The Campaigns component provides a user interface to interact with campaign data. It displays a table of campaign information and allows users to generate plots based on selected campaigns.

CRM Component
The CRM component displays CRM data in tabular format categorized by different criteria.

Dependencies
Express.js: Web framework for Node.js.
Axios: HTTP client for making requests to external APIs.
Node-cron: Library for scheduling tasks.
Mongoose: MongoDB object modeling tool.
React: Frontend library for building user interfaces.
Chart.js: JavaScript charting library.
html2canvas: Library to capture screenshots of HTML elements.
