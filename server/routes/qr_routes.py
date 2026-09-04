import io
import qrcode
from urllib.parse import urlparse
from flask import Blueprint, request, send_file, jsonify

qr_bp = Blueprint('qr', __name__)

def is_valid_url(url):
    """
    Validate if the provided string is a valid HTTP/HTTPS URL.
    """
    if not url:
        return False
    try:
        parsed = urlparse(url)
        # URL must have a valid scheme (http/https) and a host (netloc)
        return all([parsed.scheme in ['http', 'https'], parsed.netloc])
    except ValueError:
        return False

@qr_bp.route('/generate', methods=['POST'])
def generate_qr():
    """
    POST API Endpoint to generate a QR Code from a URL.
    Accepts JSON: { "url": "https://example.com" }
    """
    try:
        # Parse JSON request data
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing request body"}), 400
        
        url = data.get('url', '').strip()
        
        # Validate URL
        if not url:
            return jsonify({"error": "URL cannot be empty"}), 400
        
        if not is_valid_url(url):
            return jsonify({"error": "Invalid URL. Please enter a valid URL starting with http:// or https://"}), 400
            
        # Create the QR Code in memory
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,  # High error correction
            box_size=10,
            border=4
        )
        qr.add_data(url)
        qr.make(fit=True)
        
        # Generate the Image using Pillow (PIL)
        # Using standard black on white for maximum scan compatibility
        qr_image = qr.make_image(fill_color="black", back_color="white")
        
        # Save output in a BytesIO buffer without writing to disk
        img_io = io.BytesIO()
        qr_image.save(img_io, 'PNG')
        img_io.seek(0)
        
        return send_file(img_io, mimetype='image/png')
        
    except Exception as e:
        # Log error details and return 500 error response
        print(f"Error generating QR: {str(e)}")
        return jsonify({"error": "Internal server error while generating QR code"}), 500
