import os
from flask import Flask, render_template, url_for, jsonify, request
from dropbox_fetch import download_image_from_dropbox
from edit import stylize

app = Flask(__name__)
# Ensure the 'assets' folder exists
os.makedirs('static/assets/images', exist_ok=True)

model_names = ["candy", "mosaic", "rain_princess", "udnie"]
img_path = 'assets/images/photo.jpg'
output_image_path = 'static/assets/images/edited_photo.jpg'

@app.route('/')
def landing_page():
    # The default image to show (the already downloaded image)
    image_url = url_for('static', filename=img_path)
    return render_template('index.html', image_url=image_url, model_names=model_names)

@app.route('/fetch-image')
def fetch_image():
    download_image_from_dropbox()
    new_image_url = url_for('static', filename=img_path)
    return jsonify(image_url=new_image_url)

@app.route('/apply-style', methods=['POST'])
def apply_style():
    data = request.get_json()
    selected_model = data.get('model')

    if selected_model not in model_names:
        return jsonify({"error": "Invalid model selected"}), 400

    input_image_path = os.path.join('static', img_path)

    # Apply the style to the image
    stylize(model=selected_model, in_path=input_image_path, out_path=output_image_path)

    # Check if the edited image exists before returning the URL
    if os.path.exists(output_image_path):
        edited_image_url = url_for('static', filename='assets/images/edited_photo.jpg')
        return jsonify(image_url=edited_image_url)
    else:
        return jsonify({"error": "Styled image not found"}), 404

if __name__ == '__main__':
    port = os.environ.get('FLASK_PORT') or 8080
    port = int(port)

    # Start the Flask app
    app.run(port=port, host='0.0.0.0')
