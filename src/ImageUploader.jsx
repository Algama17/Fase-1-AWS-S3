import React, { useState, useEffect } from 'react';
import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

const s3 = new AWS.S3();

const ImageUploader = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));

    setSelectedFiles(prevFiles => [...prevFiles, ...files]);
    setPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
  };

  const handleDelete = (index) => {
    setSelectedFiles(prevFiles => {
      const newFiles = [...prevFiles];
      newFiles.splice(index, 1);
      return newFiles;
    });

    setPreviewUrls(prevUrls => {
      const newUrls = [...prevUrls];
      newUrls.splice(index, 1);
      return newUrls;
    });
  };

  const uploadFile = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploadStatus('Subiendo archivos...');
      
      await Promise.all(selectedFiles.map(async (file) => {
        const params = {
          Bucket: process.env.REACT_APP_S3_BUCKET_NAME,
          Key: file.name,
          Body: file,
          ContentType: file.type,
        };
        await s3.upload(params).promise();
      }));

      setUploadStatus('¡Archivos subidos exitosamente!');
      setSelectedFiles([]);
      setPreviewUrls([]);
    } catch (error) {
      console.error('Error al subir archivos:', error);
      setUploadStatus('Error al subir archivos');
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', maxWidth: '600px' }}>
      <h2>Subir Imágenes</h2>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
        multiple 
      />

      {previewUrls.length > 0 && (
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '10px', 
          marginTop: '20px' 
        }}>
          {previewUrls.map((url, index) => (
            <div key={url} style={{ position: 'relative' }}>
              <img 
                src={url} 
                alt={`Vista previa ${index}`} 
                style={{ 
                  width: '150px', 
                  height: '150px', 
                  objectFit: 'cover' 
                }} 
              />
              <button 
                onClick={() => handleDelete(index)}
                style={{ 
                  position: 'absolute', 
                  top: '5px', 
                  right: '5px', 
                  backgroundColor: 'blue', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '50%', 
                  cursor: 'pointer',
                  padding: '2px 8px',
                  fontSize: '12px',
                }}
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}

      <button 
        onClick={uploadFile} 
        disabled={selectedFiles.length === 0}
        style={{ 
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: 'blue',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Subir Imágenes
      </button>
      {uploadStatus && <p style={{ marginTop: '10px' }}>{uploadStatus}</p>}
    </div>
  );
};

export default ImageUploader;