import React, { useRef, useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import api from '../services/api';

const ReceiptUploader = ({ orderId, onSuccess, onError }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const validateFile = (file) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image (PNG/JPG) or PDF file.');
      return false;
    }
    if (file.size > maxSize) {
      setError('File size must be less than 5MB.');
      return false;
    }
    return true;
  };

  const handleUploadFile = async (file) => {
    if (!validateFile(file)) return;

    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append('receipt', file);

    try {
      console.log('Uploading receipt for order:', orderId);
      console.log('File:', file.name, file.type, file.size);
      
      const response = await api.post(`/orders/${orderId}/receipt`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Receipt upload response:', response.data);
      setUploadedFile(file.name);
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      console.error('Receipt upload error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to upload receipt. Please try again.';
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleUploadFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUploadFile(files[0]);
    }
  };

  const handleClick = () => {
    if (!uploading) fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl border border-stone-200 shadow-lg">
      <h3 className="text-xl font-bold text-stone-900 mb-2">Upload Payment Receipt</h3>
      <p className="text-sm text-stone-500 mb-6">
        Please upload a screenshot or PDF of your payment confirmation.
      </p>

      {!uploadedFile ? (
        <>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleClick}
            className={`relative p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
              isDragActive
                ? 'border-red-500 bg-red-50'
                : 'border-stone-300 bg-stone-50 hover:border-red-400 hover:bg-red-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept="image/png,image/jpeg,application/pdf"
              className="hidden"
              disabled={uploading}
            />

            <div className="flex flex-col items-center justify-center">
              {uploading ? (
                <>
                  <Loader className="w-10 h-10 text-red-600 animate-spin mb-3" />
                  <p className="text-sm font-semibold text-stone-700">Uploading...</p>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-stone-400 mb-3" />
                  <p className="text-sm font-semibold text-stone-900 text-center">
                    Drag & drop your receipt here
                  </p>
                  <p className="text-xs text-stone-500 mt-1">or click to browse</p>
                  <p className="text-xs text-stone-400 mt-3">PNG, JPG or PDF (Max 5MB)</p>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center flex-col gap-3 p-6 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="w-12 h-12 text-green-600" />
          <p className="text-sm font-semibold text-stone-900 text-center">
            Receipt Uploaded Successfully!
          </p>
          <p className="text-xs text-stone-500 text-center">{uploadedFile}</p>
        </div>
      )}
    </div>
  );
};

export default ReceiptUploader;
