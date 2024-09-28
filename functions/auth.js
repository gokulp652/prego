const express = require("express");
const axios = require("axios");
const querystring = require("querystring");
const serverless = require("serverless-http");

const app = express();
const router = express.Router();

app.use(express.static("public"));

let accessToken = null;


router.get("/", (req, res) => {
  res.send("Welcome to the OAuth 2.0 and Energy Data Integration Example!");
});


router.get("/catchOauthToken", async (req, res) => {
  const authorizationCode = req.query.code;

  if (authorizationCode) {
    console.log("Received Authorization Code:", authorizationCode);

    try {
      const response = await axios.post(
        "https://partner.feturtles.com/oauth/token",
        querystring.stringify({
          grant_type: "authorization_code",
          code: authorizationCode,
          redirect_uri: "http://localhost:3000/catchOauthToken",
          client_id: "xpfaaOgscZ6PHmkAh3zwP",
          client_secret: "2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          }
        }
      );

      const accessToken = response.data.access_token;
      console.log("Access Token:", accessToken);

      res.send(`
        <script>
          // Save the access token in localStorage
          localStorage.setItem('accessToken', '${accessToken}');

          // Create the URL with the accessToken as a query parameter
          const params = new URLSearchParams({ accessToken: '${accessToken}' });
          const redirectUrl = '/login.html?' + params.toString();

          // Redirect to the new URL with the token
          window.location.href = redirectUrl;
        </script>
      `);
    } catch (error) {
      console.error("Error fetching the access token:", error.response?.data || error.message);
      res.send("Error exchanging authorization code for access token.");
    }
  } else {
    res.send("Error: No authorization code provided.");
  }
});


app.use("/.netlify/functions/app", router);

module.exports.handler = serverless(app);
