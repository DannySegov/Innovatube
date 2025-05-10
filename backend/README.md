# Innovatube Backend

## Prerequisites
- Python 3.8+
- MongoDB
- pip

## Setup
1. Create a virtual environment
```bash
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies
```bash
pip install -r requirements.txt
```

3. Set up MongoDB
- Ensure MongoDB is running locally
- Update `.env` with your MongoDB connection string if needed

4. Run the application
```bash
python src/app.py
```

## Features
- User Authentication (Login/Register)
- JWT-based Authorization
- Video Upload and Retrieval
- MongoDB Integration
