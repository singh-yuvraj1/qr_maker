from flask import Flask
from flask_cors import CORS
from routes.qr_routes import qr_bp

def create_app():
    app = Flask(__name__)
    
    # Configure CORS to allow access from the React Vite frontend development environment
    # or deployed vercel instances.
    CORS(app)
    
    # Register endpoints with '/api' prefix
    app.register_blueprint(qr_bp, url_prefix='/api')
    
    @app.route('/health', methods=['GET'])
    def health_check():
        return {"status": "healthy", "service": "QR Code Generator API"}, 200
        
    return app

app = create_app()

if __name__ == '__main__':
    # Start the server on local interface, default Flask port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
