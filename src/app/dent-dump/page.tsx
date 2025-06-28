"use client";

import { useState, useCallback, useRef, useEffect } from 'react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  path: string;
  uploadDate: string;
}

export default function DentDump() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load files from Dropbox on component mount
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/dropbox/list');
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files);
      } else {
        console.error('Failed to load files');
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileUpload(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFileUpload(selectedFiles);
  }, []);

  const handleFileUpload = async (filesToUpload: File[]) => {
    setUploading(true);
    
    try {
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/dropbox/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          const error = await response.json();
          console.error('Upload failed:', error);
          continue;
        }
      }
      
      // Reload files after upload
      await loadFiles();
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (file: UploadedFile) => {
    try {
      const response = await fetch('/api/dropbox/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path: file.path })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Open download link in new tab
        window.open(data.downloadUrl, '_blank');
      } else {
        console.error('Failed to get download link');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleDelete = async (file: UploadedFile) => {
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) {
      return;
    }
    
    try {
      const response = await fetch('/api/dropbox/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path: file.path })
      });
      
      if (response.ok) {
        // Reload files after deletion
        await loadFiles();
      } else {
        console.error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Helper to check if a file is audio
  const isAudioFile = (name: string) => {
    return /\.(mp3|wav|ogg)$/i.test(name);
  };

  // Add state to store audio URLs
  const [audioUrls, setAudioUrls] = useState<{ [id: string]: string }>({});
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);

  // Function to fetch and set audio URL for a file
  const fetchAudioUrl = async (file: UploadedFile) => {
    setLoadingAudioId(file.id);
    try {
      const response = await fetch('/api/dropbox/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: file.path })
      });
      if (response.ok) {
        const data = await response.json();
        setAudioUrls((prev) => ({ ...prev, [file.id]: data.downloadUrl }));
      } else {
        console.error('Failed to get audio link');
      }
    } catch (error) {
      console.error('Error fetching audio link:', error);
    } finally {
      setLoadingAudioId(null);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          color: 'white',
          fontSize: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
          Loading files from Dropbox...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h1 style={{
            color: 'white',
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Dent Dump
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '1.2rem'
          }}>
            Your personal Dropbox file storage space
          </p>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: isDragging ? '3px dashed #4ade80' : '3px dashed rgba(255,255,255,0.3)',
            borderRadius: '20px',
            padding: '4rem 2rem',
            textAlign: 'center',
            background: isDragging 
              ? 'rgba(74, 222, 128, 0.1)' 
              : 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginBottom: '3rem'
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem'
          }}>
            📁
          </div>
          
          <h3 style={{
            color: 'white',
            fontSize: '1.5rem',
            marginBottom: '1rem'
          }}>
            {isDragging ? 'Drop files here!' : 'Drag & Drop Files Here'}
          </h3>
          
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '1rem'
          }}>
            Or click to browse files • Files will be stored in your Dropbox
          </p>
          
          {uploading && (
            <div style={{
              marginTop: '1rem',
              color: '#4ade80',
              fontSize: '1rem'
            }}>
              Uploading files to Dropbox...
            </div>
          )}
        </div>

        {/* Files List */}
        {files.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h2 style={{
              color: 'white',
              fontSize: '1.8rem',
              marginBottom: '2rem',
              borderBottom: '1px solid rgba(255,255,255,0.2)',
              paddingBottom: '1rem'
            }}>
              Dropbox Files ({files.length})
            </h2>
            
            <div style={{
              display: 'grid',
              gap: '1rem'
            }}>
              {files.map((file) => (
                <div
                  key={file.id}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      color: 'white',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem'
                    }}>
                      {file.name}
                    </div>
                    <div style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.9rem',
                      display: 'flex',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      <span>{formatFileSize(file.size)}</span>
                      <span>{formatDate(file.uploadDate)}</span>
                    </div>
                    {/* Audio player for audio files */}
                    {isAudioFile(file.name) && (
                      <div style={{ marginTop: '1rem' }}>
                        {audioUrls[file.id] ? (
                          <audio controls src={audioUrls[file.id]} style={{ width: '100%' }} />
                        ) : (
                          <button
                            onClick={() => fetchAudioUrl(file)}
                            style={{
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.5rem 1rem',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: 'bold',
                              marginTop: '0.5rem',
                              transition: 'all 0.2s ease'
                            }}
                            disabled={loadingAudioId === file.id}
                          >
                            {loadingAudioId === file.id ? 'Loading...' : 'Play'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    <button
                      onClick={() => handleDownload(file)}
                      style={{
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#059669';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#10b981';
                      }}
                    >
                      Download
                    </button>
                    
                    <button
                      onClick={() => handleDelete(file)}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#dc2626';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ef4444';
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {files.length === 0 && !loading && (
          <div style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '1.1rem',
            marginTop: '2rem'
          }}>
            No files in your Dropbox yet. Drag and drop some files to get started!
          </div>
        )}
      </div>
    </div>
  );
} 