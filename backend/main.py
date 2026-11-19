from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import auth
import tickets
from db import init_db

app = FastAPI(title="Office Helpdesk API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()
app.include_router(auth.router)
app.include_router(tickets.router)


@app.get("/")
def root():
    return {"message": "Office Helpdesk API is running. Open /docs for API docs."}
