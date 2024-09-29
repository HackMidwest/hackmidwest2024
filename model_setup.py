# SCRIPT TO SETUP MODELS
# Using methods from 
#       DOWNLOADING MODELS:
#           https://github.com/pytorch/examples/blob/main/fast_neural_style/download_saved_models.py
#       CONVERTING TO ONNX:
#           https://github.com/onnx/models/blob/main/validated/vision/style_transfer/fast_neural_style/dependencies/conversion.ipynb
#       SAVING TO S3 BUCKETS:
#           https://github.com/rh-aiservices-bu/fraud-detection/blob/main/2_save_model.ipynb

from onnx import numpy_helper
import torch, os

def model_setup():
    try:
        from torch.utils.model_zoo import _download_url_to_file
    except ImportError:
        try:
            from torch.hub import download_url_to_file as _download_url_to_file
        except ImportError:
            from torch.hub import _download_url_to_file

    local_models_directory = 'static/assets/saved_models'

    if not os.path.exists(local_models_directory):    
        _download_url_to_file('https://www.dropbox.com/s/lrvwfehqdcxoza8/saved_models.zip?dl=1', 'saved_models.zip', None, True)
        unzip('saved_models.zip', 'static/assets')
        model_names = ["candy", "mosaic", "udnie"]
        for model in model_names:
            convert_to_onnx(str(model))
    else:
        print("Skipping download and extraction.")

    if not os.path.isdir(local_models_directory):
        raise ValueError(f"The directory '{local_models_directory}' does not exist.")

    bucket = save_models()
    num_files = upload_directory_to_s3(bucket, local_models_directory, "models")

    if num_files == 0:
        raise ValueError("No files uploaded.")
    list_objects(bucket, "models")

def f(t):
    return [f(i) for i in t] if isinstance(t, (list, tuple)) else t

def g(t, res):
    for i in t:
        res.append(i) if not isinstance(i, (list, tuple)) else g(i, res)
    return res

def unzip(source_filename, dest_dir):
    import zipfile
    with zipfile.ZipFile(source_filename) as zf:
        zf.extractall(path=dest_dir)
    if os.path.exists(source_filename):
        os.remove(source_filename)

def SaveData(test_data_dir, prefix, data_list):
    if isinstance(data_list, torch.autograd.Variable) or isinstance(data_list, torch.Tensor):
        data_list = [data_list]
    for i, d in enumerate(data_list):
        d = d.data.cpu().numpy()
        SaveTensorProto(os.path.join(test_data_dir, '{0}_{1}.pb'.format(prefix, i)), prefix + str(i+1), d)
        
def SaveTensorProto(file_path, name, data):
    tp = numpy_helper.from_array(data)
    tp.name = name

    with open(file_path, 'wb') as f:
        f.write(tp.SerializeToString())

def convert_to_onnx(m_name: str):
    import re
    import onnxruntime as rt
    from model.transformer_net import TransformerNet

    input = torch.randn(1, 3, 360, 360)
    with torch.no_grad():
        model = TransformerNet()
        model_dict = torch.load(f"/projects/hackmidwest2024/static/assets/saved_models/{m_name}.pth")
        for k in list(model_dict.keys()):
            if re.search(r'in\d+\.running_(mean|var)$', k):
                del model_dict[k]
        model.load_state_dict(model_dict)
        output = model(input)
        
    input_names = ['input1']
    output_names = ['output1']
    dir = "/projects/hackmidwest2024/static/assets/saved_models/"
    if not os.path.exists(dir):
        os.makedirs(dir)
    model_dir = os.path.join(dir, f"{m_name}")
    data_dir = os.path.join(model_dir, f"{m_name}_dataset")
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)

    if isinstance(model, torch.jit.ScriptModule):
        torch.onnx._export(model, tuple((input,)), os.path.join(model_dir, f'{m_name}_model.onnx'), verbose=True, input_names=input_names, output_names=output_names, example_outputs=(output,))
    else:
        torch.onnx.export(model, tuple((input,)), os.path.join(model_dir, f'{m_name}_model.onnx'), verbose=True, input_names=input_names, output_names=output_names)

    input = f(input)
    input = g(input, [])
    output = f(output)
    output = g(output, [])
            
    SaveData(data_dir, 'input', input)
    SaveData(data_dir, 'output', output)

def save_models():
    import os
    import boto3
    import botocore

    aws_access_key_id = os.environ.get('AWS_ACCESS_KEY_ID')
    aws_secret_access_key = os.environ.get('AWS_SECRET_ACCESS_KEY')
    endpoint_url = os.environ.get('AWS_S3_ENDPOINT')
    region_name = os.environ.get('AWS_DEFAULT_REGION')
    bucket_name = os.environ.get('AWS_S3_BUCKET')

    if not all([aws_access_key_id, aws_secret_access_key, endpoint_url, region_name, bucket_name]):
        raise ValueError("One or data connection variables are empty.  "
                        "Please check your data connection to an S3 bucket.")

    session = boto3.session.Session(aws_access_key_id=aws_access_key_id,
                                    aws_secret_access_key=aws_secret_access_key)

    s3_resource = session.resource(
        's3',
        config=botocore.client.Config(signature_version='s3v4'),
        endpoint_url=endpoint_url,
        region_name=region_name)

    bucket = s3_resource.Bucket(bucket_name)
    return bucket

def upload_directory_to_s3(bucket, local_directory, s3_prefix):
    num_files = 0
    for root, dirs, files in os.walk(local_directory):
        for filename in files:
            file_path = os.path.join(root, filename)
            relative_path = os.path.relpath(file_path, local_directory)
            s3_key = os.path.join(s3_prefix, relative_path)
            print(f"{file_path} -> {s3_key}")
            bucket.upload_file(file_path, s3_key)
            num_files += 1
    return num_files


def list_objects(bucket, prefix):
    filter = bucket.objects.filter(Prefix=prefix)
    for obj in filter.all():
        print(obj.key)

model_setup()