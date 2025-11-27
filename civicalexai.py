# civicalex ai bot

import os
import json
from fastapi import FastAPI, WebSocket
import traceback

try:
    GOOGLE_API_KEY = "AIzaSyCsc791_A3zX4oPGGpjL5q3xksFxZAjQbo"
    os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY
    print("✅ Google Gemini API key loaded.")
except Exception as e:
    print(f"❌ API Key Error: {e}")

try:
    from google.adk.agents import Agent
    from google.adk.models.google_llm import Gemini
    from google.adk.runners import InMemoryRunner
    from google.adk.tools import AgentTool, google_search
    from google.genai import types

    print("✅ ADK modules imported.")
except Exception as e:
    print("❌ Failed importing Google ADK:", e)
    traceback.print_exc()

app = FastAPI()

retry_config = types.HttpRetryOptions(
    attempts=5,
    exp_base=7,
    initial_delay=1,
    http_status_codes=[429, 500, 503, 504],
)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print(" Client connected")

    try:
        while True:

            # RECEIVE MESSAGE
            data = await websocket.receive_text()
            print(" Received:", data)

            # Parse JSON safely
            try:
                msg = json.loads(data)
                user_msg = msg.get("message", "")
            except:
                user_msg = data

        
            

            root_agent = Agent(
                name="ResearchCoordinator",
                model=Gemini(
                    model="gemini-2.5-flash-lite",
                    retry_options=retry_config
                ),
                instruction=f"Provide a clear, short, and concise answer to {user_msg}.",
                tools=[google_search],
            )

            runner = InMemoryRunner(agent=root_agent )
           
            # RUN WORKFLOW
            ai_response = await runner.run_debug(f"answer for {user_msg} ")
            

            # SEND BACK RESPONSE
            reply = {
                "reply": str(ai_response),
                "length": len(str(ai_response)),
            }

            await websocket.send_text(json.dumps(reply))

    except Exception as e:
        print(" WebSocket disconnected:", e)
        traceback.print_exc()
