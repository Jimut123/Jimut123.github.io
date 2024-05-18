function openPopup(imageSrc, description) {
    document.getElementById('popupImg').src = imageSrc;
    document.getElementById('popupDescription').textContent = description;
    document.getElementById('popup').style.display = 'block';
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}
