import fs from "node:fs";

// Read the original JSON file
fs.readFile(
  "/Users/gildedpleb/Development/escape-velocity/src/bitcoin_weekly_prices_transformed.json",
  "utf8",
  (error, data) => {
    if (error) {
      console.error("Error reading the file:", error);
      return;
    }

    // Parse the JSON data
    const originalData = JSON.parse(data);

    // Transform the data
    const transformedData = originalData.map((item) => ({
      x: item.time * 1000, // Convert to milliseconds
      y: item.close,
    }));

    // Convert the transformed data back to JSON
    const outputData = JSON.stringify(transformedData, null, 2);

    // Write the new data to a file
    fs.writeFile(
      "/Users/gildedpleb/Development/escape-velocity/src/bitcoin_weekly_prices_transformed_2.json",
      outputData,
      "utf8",
      (error_) => {
        if (error_) {
          console.error("Error writing the file:", error_);
        } else {
          console.log("File successfully written.");
        }
      },
    );
  },
);
