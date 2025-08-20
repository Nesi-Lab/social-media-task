// Utility to crop an image using canvas for react-easy-crop
// Returns a base64 data URL of the cropped image
export async function getCroppedImg(imageSrc, crop) {
    const createImage = url =>
        new Promise((resolve, reject) => {
            const image = new window.Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', error => reject(error));
            image.setAttribute('crossOrigin', 'anonymous'); // needed for cross-origin images
            image.src = url;
        });

    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const { width, height, x, y } = crop;
    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(
        image,
        x,
        y,
        width,
        height,
        0,
        0,
        width,
        height
    );

    return canvas.toDataURL('image/jpeg');
} 