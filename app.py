import os
import requests
from flask import Flask, url_for, jsonify

app = Flask(__name__)

# Ensure the 'assets' folder exists
os.makedirs('static/assets', exist_ok=True)

# deployed_model_name = "fraud"
# rest_url = "http://modelmesh-serving.redhat:8008"
# infer_url = f"{rest_url}/v2/models/{deployed_model_name}/infer"

# import pickle
# with open('artifact/scaler.pkl', 'rb') as handle:
#     scaler = pickle.load(handle)

@app.route('/')
def hello():
    # The default image to show (the already downloaded image)
    image_url = url_for('static', filename='assets/downloaded_image.jpg')
    return f"""
        <html>
            <body>
                <h1>Hello World!</h1>
                <img id="image" src="{image_url}" alt="Downloaded Image" width="500" height="auto">
                <br><br>
                <button onclick="refreshImage()">Refresh Image</button>
                <script>
                    function refreshImage() {{
                        fetch('/fetch-image')
                            .then(response => response.json())
                            .then(data => {{
                                document.getElementById('image').src = data.image_url + '?v=' + new Date().getTime();
                            }});
                    }}
                </script>
            </body>
        </html>
    """

@app.route('/fetch-image')
def fetch_image():
    image_url = 'https://patchcollection.com/cdn/shop/products/Kansas-Jayhawks-Medium-Primary-Logo.jpg?v=1689435890&width=1920'  # Replace with the actual image URL
    local_filename = os.path.join('static', 'assets', 'downloaded_image.jpg')

    # Download the image from the URL
    response = requests.get(image_url, stream=True)
    if response.status_code == 200:
        # Save the image to the 'assets' folder
        with open(local_filename, 'wb') as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)

    # Return the new image URL as JSON (used by AJAX to update the image)
    new_image_url = url_for('static', filename='assets/downloaded_image.jpg')
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

    app.run(port=port,host='0.0.0.0')
