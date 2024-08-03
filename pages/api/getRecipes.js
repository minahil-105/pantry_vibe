import axios from "axios";
import got from "got";

// const GOOGLE_VISION_API_KEY = process.env.GOOGLE_VISION_API_KEY;
// const GOOGLE_VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;

const spoonacularApiKey = "8503fb24c46b4304868d6166d14c57f9"; // Replace with your Spoonacular API key

export default async function handler(req, res) {
  if (req.method === "POST") {
    
const {labels} = req.body
console.log(labels)
   
    try {
      // Step 1: Get image tags using Imagga API
      
      const formatted = labels.map((item, index) => (index > 0 ? `+${item.toLowerCase()}` : item.toLowerCase())).join(',');

  
      
     
      // Step 2: Get recipes based on tags using Spoonacular API
      const spoonacularUrl = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${formatted}&apiKey=${spoonacularApiKey}`;

      const spoonacularResponse = await axios.get(spoonacularUrl);

      res.status(200).json(spoonacularResponse.data);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Error processing request", details: error.message });
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
