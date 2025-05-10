from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from dotenv import load_dotenv
from datetime import datetime, timedelta
import os
import pymongo
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# CORS Configuration
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:4200", "http://127.0.0.1:4200", "*"],
        "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "supports_credentials": True
    }
})

# Add a preflight handler for CORS
@app.route('/options', methods=['OPTIONS'])
def handle_options():
    response = jsonify(success=True)
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Configure JWT
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-very-secret-key-that-should-be-changed')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=2)
jwt = JWTManager(app)

# MongoDB Connection
def connect_to_mongodb():
    try:
        # Detailed environment and connection logging
        logger.info('MongoDB Connection Diagnostic Information:')
        logger.info(f'Current Working Directory: {os.getcwd()}')
        logger.info(f'Environment Variables:')
        for key, value in os.environ.items():
            if 'MONGO' in key or 'DB' in key:
                logger.info(f'  {key}: {value}')
        
        # Get MongoDB URI with fallback and logging
        mongo_uri = os.getenv('MONGO_URI')
        if not mongo_uri:
            mongo_uri = 'mongodb://localhost:27017/innovatube'
            logger.warning(f'No MONGO_URI found. Using default: {mongo_uri}')
        
        logger.info(f'Attempting to connect to MongoDB at: {mongo_uri}')
        
        # Comprehensive connection configuration
        connection_params = {
            'serverSelectionTimeoutMS': 10000,  # 10 seconds
            'connectTimeoutMS': 10000,  # 10 seconds
            'socketTimeoutMS': 10000,  # 10 seconds
            'serverMonitoringMode': 'stream'
        }
        
        # Attempt connection with detailed logging
        try:
            client = pymongo.MongoClient(mongo_uri, **connection_params)
            
            # Verify connection
            client.admin.command('ismaster')
            
            # Select or create database
            db = client.get_database('innovatube')
            
            # Log successful connection details
            logger.info('MongoDB Connection Successful')
            logger.info(f'Connected to database: {db.name}')
            logger.info(f'Server version: {client.server_info()["version"]}')
            
            return db
        
        except pymongo.errors.ConnectionFailure as conn_err:
            logger.error('MongoDB Connection Failure Details:')
            logger.error(f'Connection Error: {conn_err}')
            logger.error(f'Attempted URI: {mongo_uri}')
            
            # Additional network diagnostics
            import socket
            try:
                socket.create_connection(('localhost', 27017), timeout=5)
                logger.info('Port 27017 is open')
            except (socket.timeout, ConnectionRefusedError) as port_err:
                logger.error(f'Port 27017 connection error: {port_err}')
            
            return None
        
    except Exception as unexpected_err:
        logger.error('Unexpected MongoDB Connection Error:')
        logger.error(f'Error: {unexpected_err}')
        logger.error(f'Error Type: {type(unexpected_err)}')
        
        # Log system and Python environment details
        import sys
        logger.info(f'Python Version: {sys.version}')
        logger.info(f'Platform: {sys.platform}')
        
        return None

# Attempt to connect to MongoDB
db = connect_to_mongodb()

# Fallback in-memory storage if MongoDB fails
if db is None:
    logger.warning('Using in-memory storage as fallback')
    db = {
        'favorites': [],
        'users': []
    }

# Authentication Routes
@app.route('/auth/login', methods=['POST'])
def login():
    username = request.json.get('username', None)
    password = request.json.get('password', None)
    
    # TODO: Replace with actual user validation
    user = db.users.find_one({'username': username})
    
    if user and user['password'] == password:  # In production, use password hashing!
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token), 200
    
    return jsonify({"msg": "Bad username or password"}), 401

@app.route('/auth/register', methods=['POST'])
def register():
    username = request.json.get('username', None)
    password = request.json.get('password', None)
    email = request.json.get('email', None)
    
    # Check if user already exists
    if db.users.find_one({'username': username}):
        return jsonify({"msg": "Username already exists"}), 400
    
    # Create new user
    new_user = {
        'username': username,
        'password': password,  # In production, hash this!
        'email': email
    }
    
    db.users.insert_one(new_user)
    return jsonify({"msg": "User created successfully"}), 201

# Video Routes
@app.route('/videos', methods=['GET'])
@jwt_required()
def get_videos():
    current_user = get_jwt_identity()
    videos = list(db.videos.find({'user': current_user}))
    
    # Convert ObjectId to string for JSON serialization
    for video in videos:
        video['_id'] = str(video['_id'])
    
    return jsonify(videos), 200

@app.route('/videos/upload', methods=['POST'])
@jwt_required()
def upload_video():
    current_user = get_jwt_identity()
    video_data = request.json
    
    # Add user to video metadata
    video_data['user'] = current_user
    
    result = db.videos.insert_one(video_data)
    return jsonify({"msg": "Video uploaded successfully", "id": str(result.inserted_id)}), 201

# Favorite Videos Routes
@app.route('/favorites', methods=['GET'])
@jwt_required()
def get_favorites():
    current_user = get_jwt_identity()
    favorites = list(db.favorites.find({'user': current_user}))
    
    # Convert ObjectId to string for JSON serialization
    processed_favorites = []
    for favorite in favorites:
        processed_favorite = {
            'videoId': favorite['videoId'],
            'title': favorite['title'],
            'thumbnailUrl': favorite['thumbnailUrl'],
            'channelTitle': favorite.get('channelTitle', ''),
            'addedAt': favorite['addedAt'].isoformat() if 'addedAt' in favorite else None
        }
        processed_favorites.append(processed_favorite)
    
    return jsonify(processed_favorites), 200

@app.route('/favorites/add', methods=['POST'])
@jwt_required()
def add_favorite():
    try:
        # Log full request details
        logger.info(f"Received full request headers: {request.headers}")
        logger.info(f"Received full request data: {request.get_data(as_text=True)}")
        
        # Get current user identity
        current_user = get_jwt_identity()
        logger.info(f"Current authenticated user: {current_user}")
        
        # Parse JSON data
        video_data = request.json
        if not video_data:
            logger.error("No JSON data received")
            return jsonify({"msg": "No video data provided"}), 400
        
        logger.info(f"Received video data: {video_data}")
        
        # Validate required fields
        required_fields = ['videoId', 'title', 'thumbnailUrl']
        for field in required_fields:
            if field not in video_data:
                logger.error(f"Missing required field: {field}")
                return jsonify({"msg": f"Missing required field: {field}"}), 400
        
        # Check if video is already in favorites
        existing_favorite = db.favorites.find_one({
            'user': current_user, 
            'videoId': video_data['videoId']
        })
        
        if existing_favorite:
            logger.warning(f"Video {video_data['videoId']} already in favorites")
            return jsonify({
                "msg": "Video already in favorites", 
                "alreadyExists": True,
                "video": {
                    "videoId": video_data['videoId'],
                    "title": video_data['title']
                }
            }), 200
        
        # Prepare favorite video data
        favorite_entry = {
            'user': current_user,
            'videoId': video_data['videoId'],
            'title': video_data['title'],
            'thumbnailUrl': video_data['thumbnailUrl'],
            'channelTitle': video_data.get('channelTitle', ''),
            'addedAt': datetime.utcnow()
        }
        
        # Insert into database
        result = db.favorites.insert_one(favorite_entry)
        logger.info(f"Successfully added video {video_data['videoId']} to favorites")
        
        return jsonify({
            "msg": "Video added to favorites", 
            "id": str(result.inserted_id),
            "video": {
                "videoId": favorite_entry['videoId'],
                "title": favorite_entry['title'],
                "thumbnailUrl": favorite_entry['thumbnailUrl']
            }
        }), 201
    
    except Exception as e:
        logger.error(f"Unexpected error in add_favorite: {str(e)}", exc_info=True)
        return jsonify({
            "msg": "Unexpected error occurred", 
            "error": str(e)
        }), 500

@app.route('/favorites/remove', methods=['DELETE'])
@jwt_required()
def remove_favorite():
    current_user = get_jwt_identity()
    video_data = request.json
    
    # Validate required fields
    if 'videoId' not in video_data:
        return jsonify({"msg": "Missing videoId"}), 400
    
    result = db.favorites.delete_one({
        'user': current_user, 
        'videoId': video_data['videoId']
    })
    
    if result.deleted_count > 0:
        return jsonify({
            "msg": "Video removed from favorites", 
            "videoId": video_data['videoId']
        }), 200
    else:
        return jsonify({
            "msg": "Video not found in favorites", 
            "videoId": video_data['videoId']
        }), 404

# Add these imports at the top of the file
from datetime import datetime

if __name__ == '__main__':
    app.run(debug=True, port=5000)
