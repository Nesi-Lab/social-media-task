import { useState } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../lib/cropImage';

export default function ImageCropper({ imageSrc, onSave, onCancel }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    function handleCropComplete(croppedArea, croppedAreaPixels) {
        setCroppedAreaPixels(croppedAreaPixels);
    }

    async function handleCropSave() {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        onSave(croppedImage);
    }

    function handleCropCancel() {
        onCancel();
    }

    return (
        <div className="cropper-modal" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', padding: 32, borderRadius: 16, minWidth: 420, boxShadow: '0 4px 32px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 350, height: 350, position: 'relative', background: '#222', borderRadius: 12, overflow: 'hidden' }}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={handleCropComplete}
                    />
                    {/* Circle overlay */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        zIndex: 10,
                    }}>
                        <svg width="100%" height="100%" viewBox="0 0 350 350">
                            <defs>
                                <mask id="circle-mask">
                                    <rect x="0" y="0" width="350" height="350" fill="white" />
                                    <circle cx="175" cy="175" r="140" fill="black" />
                                </mask>
                            </defs>
                            <rect x="0" y="0" width="350" height="350" fill="rgba(0,0,0,0.5)" mask="url(#circle-mask)" />
                            <circle cx="175" cy="175" r="140" fill="none" stroke="#fff" strokeWidth="3" />
                        </svg>
                    </div>
                </div>
                <div style={{ marginTop: 32, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '80%', display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                        <span style={{ marginRight: 8 }}>Zoom:</span>
                        <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={e => setZoom(Number(e.target.value))} style={{ flex: 1 }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                        <button onClick={handleCropCancel} style={{ padding: '8px 24px' }}>Cancel</button>
                        <button onClick={handleCropSave} style={{ padding: '8px 24px' }}>Save</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
