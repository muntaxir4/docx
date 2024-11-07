import express from "express";
import cors from "cors";
import multer from "multer";
import { createWorker } from "tesseract.js";
import { HfInference } from "@huggingface/inference";
import path from "path";

const client = new HfInference(process.env.HF_API_KEY);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (_, res) => {
  res.send("DOCX API");
});

// Configure Multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });
const statesOfIndia = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

// OCR Endpoint with GenAI extraction
app.post("/api/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No image uploaded" });
    return;
  }

  try {
    // Specify corePath for wasm support in Vercel
    const worker = await createWorker("eng", undefined, {
      corePath: path.join(
        __dirname,
        "node_modules",
        "tesseract.js-core",
        "tesseract-core-simd.wasm"
      ),
    });

    const {
      data: { text },
    } = await worker.recognize(req.file.buffer);

    await worker.terminate();
    // console.log("OCR Result:", text);
    if (!text.includes("THE UNION OF INDIA")) {
      res
        .status(400)
        .json({ error: "Text does not contain THE UNION OF INDIA" });
      return;
    }

    let matchedState = "";
    const containsState = statesOfIndia.some((state) => {
      if (text.toLowerCase().includes(state.toLowerCase())) {
        matchedState = state;
        return true;
      }
      return false;
    });

    if (!containsState) {
      res.status(400).json({ error: "Text does not contain a state of India" });
      return;
    }

    // Extract DL No, DOI, Valid Till, TR Date, AED Date, MCWG, LMV, TRANS, DOB
    let out = "";

    const stream = client.chatCompletionStream({
      model: "microsoft/Phi-3-mini-4k-instruct",
      messages: [
        {
          role: "user",
          content:
            'Extract only DL No, DOI, Valid Till, TR Date, AED Date, MCWG, LMV, TRANS, DOB, Name and Address from given data "THE UNION OF INDIA 4\nMAHARASHTRA STATE MOTOR DRIVING LICENCE =\nDL No MH03 20080022135 DOI * 24-01-2007 |\n=== Valid Till © 23-01-2027 (NT) 09-03-2011 (TR)\nAED 15-03-2008 ria\nAUTHORISATION TO DRIVE FOLLOWING CLASS «ss\nOF VEHICLES THROUGHOUT INDIA ve\nrr cov DOI\nMCWG 24-01-2007 a.\nLMV 24-01-2007 ~~\nTRANS 10-03-2008 y |\nDOB © 01-12-1987 BG |\nName BABU KHAN\nS/DMW of JABBAR KHAN |\nAdd KAMLA RAMAN NAGAR, BAIGANWADI, |\nGOVANDI, MUMBAI.\n4 BARU En\nPIN 400043 raw tod\n—_— Signature/Thumb\nREESE wos 2008261 © Impression of Holder"',
        },
        {
          role: "assistant",
          content:
            "DL No: MH03 20080022135\nDOI: 24-01-2007\nValid Till: 23-01-2027 (NT)\nTR Date: 09-03-2011\nAED Date: 15-03-2008\nMCWG: 24-01-2007\nLMV: 24-01-2007\nTRANS: 10-03-2008\nDOB: 01-12-1987\nName: BABU KHAN\nS/D/W of: JABBAR KHAN\nAddress: KAMLA RAMAN NAGAR, BAIGANWADI, GOVANDI, MUMBAI.\nPIN: 400043",
        },
        {
          role: "user",
          content: `Extract only DL No, DOI, Valid Till, TR Date, AED Date, MCWG, LMV, TRANS, DOB, Name and Address from given data ${text}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 1024,
      top_p: 0.7,
    });

    for await (const chunk of stream) {
      if (chunk.choices && chunk.choices.length > 0) {
        const newContent = chunk.choices[0].delta.content;
        out += newContent;
        // console.log(newContent);
      }
    }

    const result =
      `Government: THE UNION OF INDIA\nState: ${matchedState.toLocaleUpperCase()}\n` +
      out.trim();
    res.json({ text: result });
  } catch (error) {
    console.error("OCR Error:", error);
    res.status(500).json({ error: "Failed to process image" });
  }
});

// OCR Endpoint2 with manual extraction
app.post("/api/upload2", upload.single("image"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No image uploaded" });
    return;
  }

  try {
    const worker = await createWorker("eng", undefined, {
      corePath: path.join(
        __dirname,
        "node_modules",
        "tesseract.js-core",
        "tesseract-core-simd.wasm"
      ),
    });

    const {
      data: { text },
    } = await worker.recognize(req.file.buffer);

    await worker.terminate();
    console.log("OCR Result:", text);
    if (!text.includes("THE UNION OF INDIA")) {
      res
        .status(400)
        .json({ error: "Text does not contain THE UNION OF INDIA" });
      return;
    }

    let matchedState = "";
    const containsState = statesOfIndia.some((state) => {
      if (text.toLowerCase().includes(state.toLowerCase())) {
        matchedState = state;
        return true;
      }
      return false;
    });

    if (!containsState) {
      res.status(400).json({ error: "Text does not contain a state of India" });
      return;
    }

    // Extract DL No, DOI, Valid Till, TR Date, AED Date, MCWG, LMV, TRANS, DOB
    const dlNoMatch = text.match(/DL\s*No\s*([A-Z0-9\s]+)/i);
    const doiMatch = text.match(/DOI\s*\*\s*([\d-]+)/i);
    const validTillMatch = text.match(/Valid\s*Till\s*\©?\s*([\d-]+)/i);
    const trDateMatch = text.match(/TR\s*([\d-]+)/i);
    const aedDateMatch = text.match(/AED\s*([\d-]+)/i);
    const mcwgMatch = text.match(/MCWG\s*([\d-]+)/i);
    const lmvMatch = text.match(/LMV\s*([\d-]+)/i);
    const transMatch = text.match(/TRANS\s*([\d-]+)/i);
    const dobMatch = text.match(/DOB\s*©?\s*([\d-]+)/i);

    const dlNo = dlNoMatch
      ? dlNoMatch[1].replace(/\s+/g, "").trim()
      : "Not found";
    const doi = doiMatch ? doiMatch[1].trim() : "Not found";
    const validTill = validTillMatch ? validTillMatch[1].trim() : "Not found";
    const trDate = trDateMatch ? trDateMatch[1].trim() : "Not found";
    const aedDate = aedDateMatch ? aedDateMatch[1].trim() : "Not found";
    const mcwg = mcwgMatch ? mcwgMatch[1].trim() : "Not found";
    const lmv = lmvMatch ? lmvMatch[1].trim() : "Not found";
    const trans = transMatch ? transMatch[1].trim() : "Not found";
    const dob = dobMatch ? dobMatch[1].trim() : "Not found";

    const result =
      `Government: THE UNION OF INDIA\nState: ${matchedState.toLocaleUpperCase()}\n` +
      `DL No: ${dlNo}\nDOI: ${doi}\nValid Till: ${validTill}\n` +
      `TR Date: ${trDate}\nAED Date: ${aedDate}\n` +
      `MCWG: ${mcwg}\nLMV: ${lmv}\nTRANS: ${trans}\nDOB: ${dob}\n` +
      text;

    console.log("Result:", result);
    res.json({ text: result });
  } catch (error) {
    console.error("OCR Error:", error);
    res.status(500).json({ error: "Failed to process image" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
