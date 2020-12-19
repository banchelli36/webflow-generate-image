const express = require("express");
const axios = require("axios").default;
const app = express();

app.get("/generate", async (req, res) => {
  try {
    let entries = [];
    requestLocationData(0).then((response) => {
      const locationData = response.data;
      entries = [...response.data.items];
      let promiseRequests = [];
      if (locationData.count < locationData.total) {
        for (
          let i = locationData.count;
          i < locationData.total;
          i = i + locationData.limit
        ) {
          promiseRequests.push(requestLocationData(i));
        }
        Promise.all(promiseRequests).then((result) => {
          result.forEach((item) => {
            entries = [...entries, ...item.data.items];
          });
          return res.status(200).json({
            data: entries.length,
          });
        });
      }
    });
  } catch (err) {
    console.log("error: ", err);
  }
});

const requestLocationData = (offset) => {
  const url = `https://cors-anywhere.herokuapp.com/api.webflow.com/collections/5fb1c7dafe82bc064dd10ee3/items?offset=${offset}`;
  const headers = {
    Authorization:
      "Bearer a9b5f876b766f8f329f916eab857eb0d6c011096d8c8164406e386a6ef1af567",
    "accept-version": "1.0.0",
    "cache-control": "public",
    "X-Requested-With": "x-requested-with, x-requested-by",
  };
  return axios.get(url, {
    headers: headers,
  });
};

app.listen(3000, () => console.log("Gator app listening on port 3000!"));
