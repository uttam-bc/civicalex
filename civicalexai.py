# civicalex ai bot

import os
import json
from fastapi import FastAPI, WebSocket

# -----------------------------
# 1. SETUP GOOGLE API KEY
# -----------------------------
try:
    # ❌ Your original key was missing quotes and caused syntax error.
    GOOGLE_API_KEY = "AIzaSyCsc791_A3zX4oPGGpjL5q3xksFxZAjQbo"
    os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY
    print("✅ Gemini API key setup complete.")
except Exception as e:
    print(f"❌ Authentication Error: {e}")

# -----------------------------
# 2. IMPORT ADK COMPONENTS
# -----------------------------
try:
    from google.adk.agents import Agent
    from google.adk.models.google_llm import Gemini
    from google.adk.runners import InMemoryRunner
    from google.adk.tools import AgentTool, google_search
    from google.genai import types

    print("✅ ADK components imported successfully.")
except Exception as e:
    print(f"❌ ADK Import Error: {e}")

# -----------------------------
# 3. FASTAPI APP + ROUTE
# -----------------------------
app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected")

    # Retry config
    retry_config = types.HttpRetryOptions(
        attempts=5,
        exp_base=7,
        initial_delay=1,
        http_status_codes=[429, 500, 503, 504],
    )

    try:
        while True:
            # 4. RECEIVE MESSAGE
            data = await websocket.receive_text()
            print("From client:", data)

            # Parse JSON
            try:
                msg = json.loads(data)
                user_msg = msg.get("message", "")
            except:
                user_msg = data

            # -----------------------------
            # 5. DEFINE AGENTS
            # -----------------------------
            research_agent = Agent(
                name="ResearchAgent",
                model=Gemini(
                    model="gemini-2.5-flash-lite",
                    retry_options=retry_config
                ),
                instruction=user_msg,
                tools=[google_search],
                output_key="research_findings",
            )

            root_agent = Agent(
                name="ResearchCoordinator",
                model=Gemini(
                    model="gemini-2.5-flash-lite",
                    retry_options=retry_config
                ),
                instruction="Provide a clean and short answer based on the findings.",
                tools=[AgentTool(research_agent)],
            )

            # -----------------------------
            # 6. RUN THE AGENT WORKFLOW
            # -----------------------------
            runner = InMemoryRunner(agent=root_agent)

            response = await runner.run_debug(
                f"Your answer for: {user_msg}"
            )

            # -----------------------------
            # 7. SEND RESPONSE BACK
            # -----------------------------
            reply_data = {
                "reply": str(response),
                "length": len(str(response)),
            }

            await websocket.send_text(json.dumps(reply_data))

    except Exception as e:
        print("Client disconnected:", e)
