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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load files from Synology NAS on component mount (only if authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      loadFiles();
    }
  }, [isAuthenticated]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'butthead') {
      setIsAuthenticated(true);
      setShowError(false);
    } else {
      setShowError(true);
      setPassword('');
    }
  };

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/synology/list');
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
        
        const response = await fetch('/api/synology/upload', {
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
      const response = await fetch('/api/synology/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path: file.path })
      });
      
      if (response.ok) {
        // Create a blob from the response and download it
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to download file');
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
      const response = await fetch('/api/synology/delete', {
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

  // Show password form if not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '3rem',
          border: '1px solid rgba(255,255,255,0.1)',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '2rem'
          }}>
            🔒
          </div>
          
          <h1 style={{
            color: 'white',
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Access Required
          </h1>
          
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '1rem',
            marginBottom: '2rem'
          }}>
            Enter password to access Dent Dump
          </p>
          
          <form onSubmit={handlePasswordSubmit} style={{ width: '100%' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '10px',
                border: showError ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                fontSize: '1rem',
                marginBottom: '1rem',
                outline: 'none',
                backdropFilter: 'blur(10px)'
              }}
              autoFocus
            />
            
            {showError && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.9rem',
                marginBottom: '1rem'
              }}>
                Incorrect password. Try again.
              </p>
            )}
            
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'white',
                color: 'black',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Access Dent Dump
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
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
          Loading files from Synology NAS...
        </div>
      </div>
    );
  }

  return (
        <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem',
          position: 'relative'
        }}>
          <button
            onClick={() => setIsAuthenticated(false)}
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = 'black';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
            }}
          >
            🔒 Logout
          </button>
          
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
            Your personal Synology NAS file storage space
          </p>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: isDragging ? '3px dashed white' : '3px dashed rgba(255,255,255,0.2)',
            borderRadius: '20px',
            padding: '4rem 2rem',
            textAlign: 'center',
            background: isDragging 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(255,255,255,0.05)',
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
            Or click to browse files • Files will be stored on your Synology NAS
          </p>
          
          {uploading && (
            <div style={{
              marginTop: '1rem',
              color: 'white',
              fontSize: '1rem'
            }}>
              Uploading files to Synology NAS...
            </div>
          )}
        </div>

        {/* Files List */}
        {files.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{
              color: 'white',
              fontSize: '1.8rem',
              marginBottom: '2rem',
              borderBottom: '1px solid rgba(255,255,255,0.2)',
              paddingBottom: '1rem'
            }}>
              Synology NAS Files ({files.length})
            </h2>
            
            <div style={{
              display: 'grid',
              gap: '1rem'
            }}>
              {files.map((file) => (
                <div
                  key={file.id}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '10px',
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid rgba(255,255,255,0.08)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
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
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    <button
                      onClick={() => handleDownload(file)}
                      style={{
                        background: 'white',
                        color: 'black',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      Download
                    </button>
                    
                    <button
                      onClick={() => handleDelete(file)}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
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
            No files on your Synology NAS yet. Drag and drop some files to get started!
          </div>
        )}
      </div>
    </div>
  );
} 