from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import gspread
from google.oauth2.service_account import Credentials
import openai
import os
from dotenv import load_dotenv
from pydantic import BaseModel

# Load environment variables from .env file
load_dotenv()

# Get the keys from environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GOOGLE_SHEET_ID = os.getenv("GOOGLE_SHEET_ID")

# FastAPI app setup
app = FastAPI()

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI API key setup
openai.api_key = OPENAI_API_KEY

# Define a Pydantic model for chat messages
class Message(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"message": "FastAPI backend is working"}

@app.get("/api/leads")
def get_leads():
    creds = Credentials.from_service_account_file("credentials/credentials.json")
    client = gspread.authorize(creds)
    sheet = client.open_by_key(GOOGLE_SHEET_ID).sheet1  # Use the sheet ID here
    data = sheet.get_all_records()
    return {"leads": data}

# Endpoint for sending messages to the chatbot
@app.post("/api/chat")
async def chat(message: Message):
    try:
        # Sending the user message to OpenAI and getting a response
        response = openai.Completion.create(
            engine="text-davinci-003",  # Or your chosen engine
            prompt=message.text,
            max_tokens=150
        )
        return {"response": response.choices[0].text.strip()}
    except Exception as e:
        return {"error": str(e)}
