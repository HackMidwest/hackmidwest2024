import dropbox
ACCESS_TOKEN = 'YOUR_TOKEN_HERE'

def download_image_from_dropbox():
    dropbox_path = '/esp32cam_image.jpg'
    local_dir = 'static/assets/images'

    # Create a Dropbox client instance
    dbx = dropbox.Dropbox(ACCESS_TOKEN)

    # Get the filename from the Dropbox path
    filename = dropbox_path.split('/')[-1]
    
    # Full local path where the image will be saved
    local_file_path = f'{local_dir}/{filename}'
    
    try:
        # Download the file from Dropbox
        metadata, res = dbx.files_download(dropbox_path)
        
        # Write the file content to the local file
        with open(local_file_path, 'wb') as f:
            f.write(res.content)
        
        print(f"Image downloaded successfully and saved to {local_file_path}")
        return local_file_path

    except dropbox.exceptions.ApiError as err:
        print(f"Failed to download image from Dropbox: {err}")
        return None