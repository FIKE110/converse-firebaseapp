import React from 'react';
import { FaFileImage, FaFileAlt, FaFilePdf, FaFile } from 'react-icons/fa';

export const getFileIcon = (mimeType) => {
  if (mimeType.startsWith('image/')) {
    return <FaFileImage className="text-blue-500 w-6 h-6" />;
  } else if (mimeType === 'application/pdf') {
    return <FaFilePdf className="text-red-500 w-6 h-6" />;
  } else if (mimeType.startsWith('text/')) {
    return <FaFileAlt className="text-green-500 w-6 h-6" />;
  } else {
    return <FaFile className="text-gray-500 w-6 h-6" />;
  }
};