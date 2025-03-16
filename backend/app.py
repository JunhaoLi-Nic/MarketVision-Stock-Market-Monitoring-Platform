from flask import Flask, request, jsonify
from flask_cors import CORS
from routes.stock import stock_bp
import logging
from services.stock_relationships import get_market_prices

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Simplified CORS configuration
CORS(app)  # Enable CORS for all routes

# Register blueprints
app.register_blueprint(stock_bp, url_prefix='/api')

@app.before_request
def before_request():
    logger.info(f"Received request: {request.method} {request.url}")
    logger.info(f"Headers: {dict(request.headers)}")

@app.after_request
def after_request(response):
    logger.info(f"Response status: {response.status}")
    return response

# Simple test endpoint to verify the server is working
@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({'success': True, 'message': 'API is working!'})

@app.route('/api/market-prices', methods=['GET'])
def market_prices():
    # Call the function from the services module
    result = get_market_prices()
    return jsonify(result)

if __name__ == '__main__':
    logger.info("Starting Flask server on http://localhost:8002")
    app.run(host='0.0.0.0', port=8002, debug=True) 