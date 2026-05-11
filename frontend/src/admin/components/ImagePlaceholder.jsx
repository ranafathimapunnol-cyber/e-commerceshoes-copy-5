// components/ImagePlaceholder.jsx
import React from 'react';
import { Package } from 'lucide-react';

function ImagePlaceholder({ name, size = 'w-12 h-12' }) {
    return (
        <div className={`${size} bg-gray-200 rounded flex items-center justify-center`}>
            <Package size={24} className="text-gray-400" />
        </div>
    );
}

export default ImagePlaceholder;
