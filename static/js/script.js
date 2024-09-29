function refreshImage() {
    fetch('/fetch-image')
        .then(response => response.json())
        .then(data => {
            document.getElementById('image').src = data.image_url + '?v=' + new Date().getTime();

            // Clear the edited image when refreshing the original image
            var styledImage = document.getElementById('styled-image');
            styledImage.src = '';
            styledImage.style.display = 'none';  // Hide the edited image
        })
        .catch(error => console.error('Error refreshing image:', error));
}

function editImage() {
    // Get the selected model from the dropdown
    var selectedModel = document.getElementById('model-select').value;

    // Send the selected model to the Flask backend
    fetch('/apply-style', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: selectedModel
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.image_url) {
            // Update the image below the STYLE button with the stylized image
            var styledImage = document.getElementById('styled-image');
            styledImage.src = data.image_url + '?v=' + new Date().getTime();
            styledImage.style.display = 'block';  // Show the image if it exists
        }
    })
    .catch(error => console.error('Error applying style:', error));
}
