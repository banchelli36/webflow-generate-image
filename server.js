const express = require("express");
const axios = require("axios").default;
const app = express();
const jsonfile = require("jsonfile");
const locationsFile = "./locations.json";
// const locationsData = require("./locations.json");

const fs = require("fs");
const request = require("request");
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: {
      info: "alessandro banchelli development server",
    },
  });
});

app.get("/generate", async (req, res) => {
  console.log("webhook triggered: ");
  //   try {
  //     let entries = [];
  //     requestLocationData(0).then((response) => {
  //       const locationData = response.data;
  //       entries = [...response.data.items];
  //       let promiseRequests = [];
  //       if (locationData.count < locationData.total) {
  //         for (
  //           let i = locationData.count;
  //           i < locationData.total;
  //           i = i + locationData.limit
  //         ) {
  //           promiseRequests.push(requestLocationData(i));
  //         }
  //         Promise.all(promiseRequests).then((result) => {
  //           result.forEach((item) => {
  //             entries = [...entries, ...item.data.items];
  //           });
  //           generateImages(entries);
  //           return res.status(200).json({
  //             data: entries.length,
  //           });
  //         });
  //       }
  //     });
  //   } catch (err) {
  //     console.log("error: ", err);
  //   }
  res.status(200).json({
    message: "triggered",
  });
});

app.post("/generate", async (req, res) => {
//   const requestData = req.body;
  console.log("webhook triggered post: ", JSON.stringify(req));
  res.status(200).json({
    message: "triggered",
  });
});

app.get("/generate-image", async (req, res) => {
  //   res.status(200).json({
  //     data: locationsData,
  //   });
  generateImages(locationsData);
  res.status(200).json({
    data: "locationsData",
  });
});

const requestLocationData = (offset) => {
  const url = `https://cors-anywhere.herokuapp.com/api.webflow.com/collections/5fb1c7dafe82bc064dd10ee3/items?offset=${offset}`;
  const headers = {
    Authorization:
      "Bearer bdb47ad338896ff91f7d7a64236a91640ecf45826e9cb24f604d69b11ed9eb87",
    "accept-version": "1.0.0",
    "cache-control": "public",
    "X-Requested-With": "x-requested-with, x-requested-by",
  };
  return axios.get(url, {
    headers: headers,
  });
};

const generateImages = (locationData) => {
  locationData.forEach((item) => {
    if (item.latitude && item.longitude) {
      downloadImage(
        `http://maps.googleapis.com/maps/api/staticmap?size=500x456&center=${item.latitude},${item.longitude}&zoom=16&style=visibility:on&style=feature:water%7Celement:geometry%7Cvisibility:on&style=feature:landscape%7Celement:geometry%7Cvisibility:on&style=feature:landscape%7Celement:all%7Ccolor:0xf2f2f2&style=feature:poi|visibility:off&style=feature:administrative%7Celement:labels.text.fill%7Ccolor:0x444444&style=feature:road.highway%7Celement:all%7Cvisibility:simplified&style=feature:road%7Celement:all%7Csaturation:-100&style=feature:road%7Celement:all%7Clightness:45&style=feature:road.arterial%7Celement:labels.icon%7Cvisibility:off&style=feature:water%7Celement:geometry%7Ccolor:0xc0e4f3&markers=icon:https://uploads-ssl.webflow.com/5ea4822fd3a80f6c9cc4fdd9/5f87fae52f748c7c5ad55614_5f81e4e7374a417200dc2551_Geo_Tag.png%7Clabel:S%7C${item.latitude},${item.longitude}&key=AIzaSyA3foPM-dJbV6EXfYoC-zb7-ZY8vcjyiNo`,
        `studio-images/${item.name}(${item._id}).png`,
        () => {}
      );
    }
  });
};

const downloadImage = (url, fileName, callback) => {
  request.head(url, function (err, res, body) {
    request(url).pipe(fs.createWriteStream(fileName)).on("close", callback);
  });
};

app.listen(3000, () => console.log("Gator app listening on port 3000!"));
