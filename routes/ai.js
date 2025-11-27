const express = require("express");
const WebSocket = require("ws");

const router = express.Router();


let ws;


function connectWS() {
  console.log("Connecting to Python WebSocket...");

  ws = new WebSocket("ws://127.0.0.1:8000/ws");

  ws.on("open", () => {
    console.log("✅ Connected to Python WebSocket");
  });

  ws.on("close", () => {
    console.log("❌ Python WS closed. Reconnecting...");
    setTimeout(connectWS, 2000);
  });

  ws.on("error", (err) => {
    console.error("WS Error:", err.message);
  });
}

connectWS();

//  SEND MESSAGE TO PYTHON AI

function sendToPython(message) {
  return new Promise((resolve, reject) => {

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return reject("Python WebSocket not connected.");
    }

    // Receive single message
    const handleMessage = (data) => {
      ws.off("message", handleMessage);
      resolve(data.toString());
    };

    ws.on("message", handleMessage);

    ws.send(JSON.stringify({ message }));
  });
}

router.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await sendToPython(message);
    res.json({ reply: response });

  } catch (error) {
    console.error("Python WS Error:", error);
    res.json({ reply: "Python WebSocket error." });
  }
});

module.exports = router;
