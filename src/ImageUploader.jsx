import React, { useState } from 'react';
import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

const s3 = new AWS.S3();

const ImageUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    try {
      setUploadStatus('Subiendo archivo...');
      
      const params = {
        Bucket: process.env.REACT_APP_S3_BUCKET_NAME,
        Key: selectedFile.name,
        Body: selectedFile,
        ContentType: selectedFile.type,
      };

      await s3.upload(params).promise();
      setUploadStatus('¡Archivo subido exitosamente!');
    } catch (error) {
      console.error('Error al subir archivo:', error);
      setUploadStatus('Error al subir archivo');
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', maxWidth: '400px' }}>
      <h2>Subiraaaaaa Imagen</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {previewUrl && (
        <div style={{ marginTop: '10px' }}>
          <h3>Vista Previa:</h3>
          <img src={previewUrl} alt="Vista previa" style={{ width: '100%', height: 'auto' }} />
        </div>
      )}
      <button onClick={uploadFile} disabled={!selectedFile}>
        Subir Imagen
      </button>
      {uploadStatus && <p style={{ marginTop: '10px' }}>{uploadStatus}</p>}
    </div>
  );
};

export default ImageUploader;