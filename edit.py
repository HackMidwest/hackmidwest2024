from model.transformer_net import TransformerNet
from model.utils import load_image, save_image
from torchvision import transforms
import numpy as np
import torch, json

def stylize(model, in_path, out_path):
    device = torch.device("cpu") # USE INTEL CPU FOR AMX

    content_image = load_image(in_path, size=224)
    content_transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Lambda(lambda x: x.mul(255))
    ])
    content_image = content_transform(content_image)
    content_image = content_image.unsqueeze(0).to(device)

    output = stylize_onnx(model, content_image)
    if output.dim() == 4:  # Check if batch dimension exists
        output = output.squeeze(0)
    elif output.dim() != 3:
        raise ValueError(f"Unexpected output shape: {output.shape}")
    
    save_image(out_path, output)


def stylize_onnx(model, content_image):
    """
    Read ONNX model and run it using onnxruntime
    """
    if model not in ["candy", "mosaic", "udnie"]:
        raise ValueError(f"Invalid model type: {model}")

    def to_numpy(tensor):
        return (
            tensor.detach().cpu().numpy()
            if tensor.requires_grad
            else tensor.cpu().numpy()
        )

    ort_inputs = to_numpy(content_image).tolist()[0]
    img_out_y = rest_request(model, ort_inputs)

    return torch.from_numpy((np.array(img_out_y)).reshape(3, 224, 224))

def rest_request(model: str, data):
    import requests

    if model not in ["candy", "mosaic", "udnie"]:
        return None
    else:
        rest_url = "http://modelmesh-serving.brightness:8008"
        infer_url = f"{rest_url}/v2/models/{model}/infer"

        # Flatten the input data to a 1D array (required by the API)
        flat_data = np.array(data).flatten().tolist()

        # Construct the correct JSON payload
        json_data = {
            "inputs": [
                {
                    "name": "input1",
                    "datatype": "FP32",
                    "shape": [1] + list(np.array(data).shape),  # Keep the shape as needed
                    "data": flat_data  # Use the flattened data
                }
            ]
        }

        # Send the POST request to the API
        response = requests.post(infer_url, json=json_data)
        response_dict = response.json()

        # Check and return the output
        if 'outputs' in response_dict:
            return response_dict['outputs'][0]['data']
        else:
            print(f"Error in response: {response_dict}")
            return None