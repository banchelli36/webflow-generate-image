const express = require("express");
const axios = require("axios").default;
const app = express();
const jsonfile = require("jsonfile");
const locationsFile = "./locations.json";
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const path = require("path");

const fs = require("fs");
const request = require("request");
const cors = require("cors");

app.use(express.static(path.resolve("./public")));
app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: {
      info: "alessandro banchelli development server",
    },
  });
});

app.get("/generate-all", jsonParser, (req, res) => {
  console.log("webhook triggered: ", req.body);
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
          generateImages(entries);
          return res.status(200).json({
            data: entries.length,
          });
        });
      }
    });
  } catch (err) {
    console.log("error: ", err);
  }
  res.status(200).json({
    message: "triggered",
  });
});

app.post("/generate", jsonParser, (req, res) => {
  let locationData = [];
  const collectionData = req.body;
  locationData.push(collectionData);
  updateLocationJsonFile(collectionData);
  generateImages(locationData);
  console.log("webhook triggered post: ", req.body);
  res.status(200).json({
    message: "image is generated",
  });
});

app.get("/generate-image", async (req, res) => {
  res.status(200).json({
    data: "generate-image",
  });
});

app.get("/studios", async (req, res) => {
  fs.readFile("./locations.json", "utf8", (err, jsonString) => {
    if (err) {
      console.log("Error reading file from disk:", err);
      return;
    }
    try {
      const locationsData = JSON.parse(jsonString);
      console.log("locationsData is:", locationsData); // => "Customer address is: Infinity Loop Drive"
      res.status(200).json({
        status: "ok",
        data: locationsData,
        counter: locationsData.length,
      });
    } catch (err) {
      console.log("Error parsing JSON string:", err);
      res.status(400).json({
        status: "failed",
        error: err,
      });
    }
  });
});

const updateLocationJsonFile = (locationData) => {
  jsonReader("./locations.json", (err, locations) => {
    if (err) {
      console.log("Error reading file:", err);
      return;
    }
    let newCollectionFlag = false;
    
    locations.map(element => {
      if(element.slug == locationData.slug) {
        element = locationData;
        newCollectionFlag = true;
      }
    });

    if(newCollectionFlag === false) {
      locations.push(locationData);
    }
    
    fs.writeFile("./locations.json", JSON.stringify(locations), (err) => {
      if (err) console.log("Error writing file:", err);
    });
  });
};

function jsonReader(filePath, cb) {
  fs.readFile(filePath, (err, fileData) => {
      if (err) {
          return cb && cb(err)
      }
      try {
          const object = JSON.parse(fileData)
          return cb && cb(null, object)
      } catch(err) {
          return cb && cb(err)
      }
  })
}

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
        `http://maps.googleapis.com/maps/api/staticmap?size=500x456&center=${item.latitude},${item.longitude}&zoom=16&style=visibility:on&style=feature:water%7Celement:geometry%7Cvisibility:on&style=feature:landscape%7Celement:geometry%7Cvisibility:on&style=feature:landscape%7Celement:all%7Ccolor:0xf2f2f2&style=feature:poi|visibility:off&style=feature:administrative%7Celement:labels.text.fill%7Ccolor:0x444444&style=feature:road.highway%7Celement:all%7Cvisibility:simplified&style=feature:road%7Celement:all%7Csaturation:-100&style=feature:road%7Celement:all%7Clightness:45&style=feature:road.arterial%7Celement:labels.icon%7Cvisibility:off&style=feature:water%7Celement:geometry%7Ccolor:0xc0e4f3&markers=icon:https://uploads-ssl.webflow.com/5ea4822fd3a80f6c9cc4fdd9/5f87fae52f748c7c5ad55614_5f81e4e7374a417200dc2551_Geo_Tag.png%7Clabel:S%7C${item.latitude},${item.longitude}&key=googlemapkey`,
        `public/studio-images/hotworx-map-${item.slug}.png`,
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

// http://maps.googleapis.com/maps/api/staticmap?size=500x456&center=30.162550,-95.461350&zoom=16&style=visibility:on&style=feature:water%7Celement:geometry%7Cvisibility:on&style=feature:landscape%7Celement:geometry%7Cvisibility:on&style=feature:landscape%7Celement:all%7Ccolor:0xf2f2f2&style=feature:poi|visibility:off&style=feature:administrative%7Celement:labels.text.fill%7Ccolor:0x444444&style=feature:road.highway%7Celement:all%7Cvisibility:simplified&style=feature:road%7Celement:all%7Csaturation:-100&style=feature:road%7Celement:all%7Clightness:45&style=feature:road.arterial%7Celement:labels.icon%7Cvisibility:off&style=feature:water%7Celement:geometry%7Ccolor:0xc0e4f3&markers=icon:https://uploads-ssl.webflow.com/5ea4822fd3a80f6c9cc4fdd9/5f87fae52f748c7c5ad55614_5f81e4e7374a417200dc2551_Geo_Tag.png%7Clabel:S%7C30.162550,-95.461350&key=googlemapkey
