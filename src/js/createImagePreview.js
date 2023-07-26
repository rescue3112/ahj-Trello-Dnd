function createImagePreview(element, img) {
  const containerImage = document.createElement('DIV');
  const imagePreview = document.createElement('IMG');

  containerImage.classList.add('container_image');
  imagePreview.classList.add('preview_image');

  imagePreview.src = img;

  element.appendChild(containerImage);
  containerImage.appendChild(imagePreview);
}

export default createImagePreview;
