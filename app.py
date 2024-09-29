import os, requests
from flask import Flask, url_for, jsonify
from dropbox_fetch import download_image_from_dropbox

app = Flask(__name__)
# Ensure the 'assets' folder exists
os.makedirs('static/assets/images', exist_ok=True)

# deployed_model_name = "fraud"
# rest_url = "http://modelmesh-serving.redhat:8008"
# infer_url = f"{rest_url}/v2/models/{deployed_model_name}/infer"

@app.route('/')
def landing_page():
    # The default image to show (the already downloaded image)
    image_url = url_for('static', filename='assets/images/esp32cam_image.jpg')
    return f"""
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>PixelForge: AI-Assisted Photo Editing</title>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        color: #333;
                        text-align: center;
                        margin: 0;
                        padding: 20px;
                    }}
                    h1 {{
                        color: #ff5722;
                    }}
                    img {{
                        max-width: 50%;
                        height: auto;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        margin-bottom: 20px;
                        border-radius: 8px;
                    }}
                    button {{
                        background-color: #ff5722;
                        color: white;
                        padding: 10px 20px;
                        border: none;
                        border-radius: 4px;
                        font-size: 16px;
                        cursor: pointer;
                        transition: background-color 0.3s ease;
                    }}
                    button:hover {{
                        background-color: #e64a19;
                    }}
                </style>
            </head>
            <body>
                <h1>PixelForge: AI-Assisted Photo Editing on the Go!</h1>
                <img id="image" src="{image_url}" alt="Downloaded Image">
                <br>
                <button onclick="refreshImage()">Refresh Image</button>
                <script>
                    function refreshImage() {{
                        fetch('/fetch-image')
                            .then(response => response.json())
                            .then(data => {{
                                document.getElementById('image').src = data.image_url + '?v=' + new Date().getTime();
                            }})
                            .catch(error => console.error('Error refreshing image:', error));
                    }}
                </script>
            </body>
        </html>
    """

@app.route('/fetch-image')
def fetch_image():
    download_image_from_dropbox()
    new_image_url = url_for('static', filename='assets/images/esp32cam_image.jpg')
    return jsonify(image_url=new_image_url)

# @app.route('/')
# def hello():
#     return f"""
#          Hello World!
#          {predict(10)}
#          {predict(1000)}
#     """

# def predict(price):
#     # prediction parameter
#     distance=200
#     relative_price=price
#     using_pin_number=1
#     using_chip=1
#     online_transaction=0
#     data = [distance, relative_price, using_pin_number, using_chip, online_transaction]
#     prediction = rest_request(scaler.transform([data]).tolist()[0])
#     threshhold = 0.95
#     fraudulent = 'fraud'

#     if (prediction[0] <= threshhold):
#         fraudulent = 'not fraud'

#     return f"""
#     <hr/>
#     <br/>price: ${str(price)}
#     <br/>fraudulent: {fraudulent}
#     <br/>prediction: {str( prediction[0] )}
#     """

# def rest_request(data):
#     json_data = {
#         "inputs": [
#             {
#                 "name": "dense_input",
#                 "shape": [1, 5],
#                 "datatype": "FP32",
#                 "data": data
#             }
#         ]
#     }
#     response = requests.post(infer_url, json=json_data)
#     response_dict = response.json()
#     return response_dict['outputs'][0]['data']

if __name__ == '__main__':
    port = os.environ.get('FLASK_PORT') or 8080
    port = int(port)

    # Start the Flask app
    app.run(port=port, host='0.0.0.0')
