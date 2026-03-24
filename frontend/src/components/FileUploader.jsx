import React, { useRef, useState } from 'react';
import './FileUploader.css';

/**
 * Shared FileUploader Component
 * Simulates a file upload and calls onUploadSuccess with { name, url, type }
 * In a real app, this would upload to Cloudinary or AWS S3 and return the URL.
 */
const FileUploader = ({ onUploadSuccess, accept = "*", label = "Upload File" }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);

    // Simulate upload delay and base64 conversion
    const reader = new FileReader();
    reader.onloadend = () => {
      // Fake cloud upload success
      setTimeout(() => {
        setIsUploading(false);
        onUploadSuccess({
          name: file.name,
          url: reader.result, // using base64 for now
          type: file.type || 'application/octet-stream'
        });
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="file-uploader">
      <label className="file-uploader__label">{label}</label>
      <div className="file-uploader__input-container">
        <input 
          type="file" 
          ref={fileInputRef} 
          accept={accept} 
          onChange={handleFileChange} 
          className="file-uploader__input"
        />
        {isUploading && <span className="file-uploader__status">Uploading...</span>}
      </div>
      {fileName && !isUploading && (
        <div className="file-uploader__success">
          Uploaded: {fileName}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
