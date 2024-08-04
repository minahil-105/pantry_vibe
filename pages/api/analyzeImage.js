import axios from "axios";
import got from "got";

//yarn dev

const imaggaApiKey = "acc_6a40298ba1dc57d";
const imaggaApiSecret = "76d9e39b60392a34ed87d929b1c6d9a9";
const spoonacularApiKey = "8503fb24c46b4304868d6166d14c57f9"; // Replace with your Spoonacular API key

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "No image URL provided" });
    }

    try {
      // Step 1: Get image tags using Imagga API
      const imaggaUrl =
        "https://api.imagga.com/v2/tags?image_url=" +
        encodeURIComponent(imageUrl);

      const imaggaResponse = await got(imaggaUrl, {
        username: imaggaApiKey,
        password: imaggaApiSecret,
      });

      const tags = JSON.parse(imaggaResponse.body).result.tags;
      if (tags.length === 0) {
        return res.status(400).json({ error: "No tags found for the image" });
      }
      res.status(200).json(tags);
    } catch (error) {
      console.error("Error:", error);
      res
        .status(500)
        .json({ error: "Error processing request", details: error.message });
    }

    // try {

    // const response = await axios.post(GOOGLE_VISION_API_URL, {
    //   requests: [
    //     {
    //       image: {
    //         source: { imageUri: imageUrl },
    //       },
    //       features: [{ type: "LABEL_DETECTION", maxResults: 1 }],
    //     },
    //   ],
    // });

    // const labels = response.data.responses[0].labelAnnotations.map(
    //   (label) => label.description
    // );
    //   res.status(200).json(labels);
    // } catch (error) {
    //   console.error("Error analyzing image:",error);
    //   res.status(500).json({ error: "Error analyzing image", details: error });
    // }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
