const MAX_IMAGES = 6;
const TARGET_SHORT = 685;
const FINAL_WIDTH = 1502;
const FINAL_HEIGHT = 2104;
const GAP = 10;

const ROWS = 3;
const COLS = 2;

const cellWidth = Math.floor((FINAL_WIDTH - (COLS + 1) * GAP) / COLS);
const cellHeight = Math.floor((FINAL_HEIGHT - (ROWS + 1) * GAP) / ROWS);

const MAX_FILE_SIZE = 50 * 1024 * 1024;

let uploadedImages = [];
let previewUrls = [];

const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const canvas = document.getElementById('canvas');
const downloadBtn = document.getElementById('downloadBtn');
const placeholder = document.getElementById('placeholder');

function cropToSquare(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const w = img.width;
    const h = img.height;
    const short = Math.min(w, h);
    
    canvas.width = short;
    canvas.height = short;
    
    const left = (w - short) / 2;
    const top = (h - short) / 2;
    
    ctx.drawImage(img, left, top, short, short, 0, 0, short, short);
    return canvas;
}

function resizeImage(img) {
    const sq = cropToSquare(img);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = TARGET_SHORT;
    canvas.height = TARGET_SHORT;
    
    ctx.drawImage(sq, 0, 0, TARGET_SHORT, TARGET_SHORT);
    return canvas;
}

function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };
        
        img.src = url;
    });
}

function validateFile(file) {
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size too large. Please use files under ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB.`);
    }
    if (file.type && !file.type.startsWith('image/')) {
        throw new Error('Please select image files only.');
    }
    return true;
}

function cleanupPreviewUrls() {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    previewUrls = [];
}

function updatePreview() {
    cleanupPreviewUrls();
    imagePreview.innerHTML = '';

    uploadedImages.forEach((file, index) => {
        const previewDiv = document.createElement('div');
        previewDiv.className = 'relative bg-gray-100 rounded-lg overflow-hidden aspect-square';

        const img = document.createElement('img');
        img.className = 'w-full h-full object-cover';
        
        const url = URL.createObjectURL(file);
        previewUrls.push(url);
        img.src = url;
        img.alt = `Preview ${index + 1}`;

        const removeBtn = document.createElement('div');
        removeBtn.className = 'absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm cursor-pointer transition-colors hover:bg-red-600';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => removeImage(index);

        previewDiv.appendChild(img);
        previewDiv.appendChild(removeBtn);
        imagePreview.appendChild(previewDiv);
    });

    generateBtn.disabled = uploadedImages.length === 0;
}

function removeImage(index) {
    uploadedImages.splice(index, 1);
    updatePreview();
}

function clearImages() {
    uploadedImages = [];
    cleanupPreviewUrls();
    updatePreview();
    canvas.style.display = 'none';
    placeholder.style.display = 'block';
    downloadBtn.style.display = 'none';
}

async function main() {
    if (uploadedImages.length === 0) return;

    try {
        const images = [];
        
        for (let i = 0; i < Math.min(uploadedImages.length, MAX_IMAGES); i++) {
            const file = uploadedImages[i];
            const img = await loadImageFromFile(file);
            const resizedCanvas = resizeImage(img);
            images.push(resizedCanvas);
        }

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, FINAL_WIDTH, FINAL_HEIGHT);

        for (let idx = 0; idx < images.length; idx++) {
            const img = images[idx];
            const row = Math.floor(idx / COLS);
            const col = idx % COLS;

            const cellX = GAP + col * (cellWidth + GAP);
            const cellY = GAP + row * (cellHeight + GAP);
            
            const imgW = img.width;
            const imgH = img.height;
            const offsetX = cellX + Math.floor((cellWidth - imgW) / 2);
            const offsetY = cellY + Math.floor((cellHeight - imgH) / 2);

            ctx.drawImage(img, offsetX, offsetY);
        }

        canvas.style.display = 'block';
        placeholder.style.display = 'none';
        downloadBtn.style.display = 'inline-block';

    } catch (error) {
        console.error('Image generation error:', error);
        alert(`Image generation error: ${error.message}`);
    }
}

function downloadImage() {
    try {
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
        const filename = `join_image_${timestamp}.png`;

        link.href = canvas.toDataURL('image/png');
        link.download = filename;
        link.click();
    } catch (error) {
        console.error('Download error:', error);
        alert('Failed to download image.');
    }
}

imageInput.addEventListener('change', async (event) => {
    const files = event.target.files;
    if (!files) return;

    const validFiles = [];
    const errors = [];

    for (const file of files) {
        try {
            validateFile(file);
            validFiles.push(file);
        } catch (error) {
            errors.push(`${file.name}: ${error.message}`);
        }
    }

    if (errors.length > 0) {
        alert(`The following files were skipped:\n${errors.join('\n')}`);
    }

    const newFiles = validFiles.slice(0, MAX_IMAGES - uploadedImages.length);
    uploadedImages.push(...newFiles);

    if (uploadedImages.length > MAX_IMAGES) {
        uploadedImages = uploadedImages.slice(-MAX_IMAGES);
    }

    updatePreview();
    imageInput.value = '';
});

generateBtn.addEventListener('click', main);
clearBtn.addEventListener('click', clearImages);
downloadBtn.addEventListener('click', downloadImage);
window.addEventListener('beforeunload', cleanupPreviewUrls);

updatePreview(); 


/*
IOOAgOOAgOOAgOOAgCDjgIDjgIDjgIDjgIAg77yP77+j77y8DQrjgIDjgIDjgIDjgIDjgIDjgIDjgIDjgIDjgIB844CA44CA44CAIOOAgHwNCuOAgOOAgOOAgOOAgCDjgIDjgIDjgIDjgIDjgIDvvLzvvL/vvI8NCuOAgOOAgOOAgOOAgOOAgOOAgOOAgOOAgOOAgOOAgOOAgHwNCuOAgOOAgOOAgOOAgOOAgOOAgCDjgIDvvI8g77+jIO+/o+OAgO+8vA0K44CA44CA44CA44CA44CA44CA77yP44CA44CA77y844CA77yP44CA44CA77y8DQrjgIDjgIDjgIDjgIAg77yP44CA44CAIOKMkuOAgOOAgOOAgOKMkiDjgIDjgIDvvLzjgIDjgojjgY/jgZ7jgr3jg7zjgrnjgrPjg7zjg4njgb7jgafnorroqo3jgZfjgabjgY/jgozjgZ8NCuOAgOOAgOOAgOOAgCB844CA44CA44CA44CA77yIX1/kurpfX++8ieOAgOOAgCDjgIDjgIB844CA6KSS576O44Go44GX44Gm44Kq44OX44O844OK44KS6LK344GG5qip5Yip44KS44KE44KN44GGDQrjgIDjgIDjgIDjgIAg77y844CA44CA44CAIO+9gCDijJLCtOOAgOOAgOOAgOOAgO+8j+OAgOOAgOOAgOKYhg0K44CA44CA44CA44CA44CAL+ODve+9pC0t44O8772k77y/77y/LC3igJDCtOOAgO+8vOKUgO+8jw0K44CA44CAIOOAgO+8j+OAgD4g44CA44CA44O94pa84peP4pa8PO+8vOOAgOOAgHx8772w772kLg0K44CAIOOAgC8g44O9772k44CA44CA44CA77y8IGnjgIB8772hfOOAgHwv44CAIOODveOAgCjjg4vvvaTvvYDjg70uDQrjgIDjgIAubOOAgOOAgOOAgOODvSDjgIDjgIDjgIAgbOOAgHzvvaF844CAfCDvvZIt772keeOAgO+9gO++huOAgCDvvokg77y8DQrjgIDjgIBs44CA44CA44CA44CAIHzjgIDjgIAg44CAfOODvOKUgCB8IO+/oyBsIOOAgOOAgO+9gH7jg73vvL/jg47vvL/vvL/vvL9fDQrjgIDjgIDjgIDjgIDjgIDvvI/vv6Pvv6Pvv6Pvv6Pjg70tJ+ODvS0tJ+OAgOOAgO+8j+OAgOOCquODl+ODvOODiuOAgCDvvI98DQrjgIDjgIDjgIDjgIAufO+/o++/o++/o++/o++/o++/o3zvvI9844CA44CA44CAIHzvv6Pvv6Pvv6Pvv6Pvv6Pvv6N877yPfCDvvL/vvL/vvL/vvL/vvL/vvL8NCuOAgO+8j++/o+OCquODl+ODvOODiu+8j3zjgIDvv6N8X1/jgI3vvI9f44Kq44O844OX44OK44CA44CA77yPfO+/o3xfXyzjgI3vvL/vvL9f44CA44CA44CA44CA77yPfA0K44CAfO+/o++/o++/o++/o++/o3zvvI/jgqrjg5fjg7zjg4rvv6PvvI/vv6Pvv6Pvv6Pvv6N877yPIOOCquODl+ODvOODiiDvvI9844CA44CA77yP44CALnwNCuOAgHzvv6Pvv6Pvv6Pvv6Pvv6N877+j77+j77+j77+j77+jfO+8j2zvv6Pvv6Pvv6Pvv6N877+j77+j77+j77+j77+jfO+8j3zjgIDvvI8NCuOAgHzvv6Pvv6Pvv6Pvv6Pvv6Pvv6Pvv6Pvv6Pvv6Pvv6Pvv6Pvv6Pvv6Pvv6Pvv6Pvv6Pvv6Pvv6Pvv6Pvv6Pvv6Pvv6Pvv6N8
*/