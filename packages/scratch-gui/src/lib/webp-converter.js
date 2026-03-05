export default webpImage => new Promise(resolve => {
    const imageUrl = typeof webpImage === 'string' ?
        webpImage :
        window.URL.createObjectURL(new Blob([webpImage], { type: 'image/webp' }));
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = document.createElement('img');
    image.addEventListener('load', () => {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        ctx.drawImage(image, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        window.URL.revokeObjectURL(imageUrl);
        resolve(dataUrl);
    });
    image.setAttribute('src', imageUrl);
});
