'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileUpload, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface BulkUploaderProps {
  onUpload: (queries: { searchQuery: string; location: string }[]) => void;
  isProcessing: boolean;
}

export default function BulkUploader({ onUpload, isProcessing }: BulkUploaderProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n');
    const queries = lines
      .map(line => {
        const [searchQuery, location] = line.split(',').map(s => s.trim());
        return searchQuery ? { searchQuery, location: location || '' } : null;
      })
      .filter((query): query is { searchQuery: string; location: string } => query !== null);
    
    onUpload(queries);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-8 text-center ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".csv,.txt"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isProcessing}
      />
      
      <div className="space-y-4">
        <FontAwesomeIcon 
          icon={isProcessing ? faSpinner : faFileUpload} 
          className={`w-12 h-12 text-gray-400 ${isProcessing ? 'animate-spin' : ''}`}
        />
        <div>
          <p className="text-lg font-medium text-gray-700">
            {isProcessing ? 'Processing...' : 'Drop your CSV file here'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {isProcessing 
              ? 'Please wait while we process your queries'
              : 'or click to select a file (.csv or .txt)'}
          </p>
        </div>
        <div className="text-xs text-gray-500">
          Format: searchQuery,location (one per line)
        </div>
      </div>
    </div>
  );
}
