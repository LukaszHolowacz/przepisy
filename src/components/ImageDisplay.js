import React, { useState, useEffect } from 'react';

function ImageDisplay({ buffer, alt }) {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (buffer && buffer.data) {
      // Tworzenie Blob na podstawie danych binarnych
      const blob = new Blob([new Uint8Array(buffer.data)], { type: 'image/jpeg' });

      // Tworzenie adresu URL dla Blob
      const url = URL.createObjectURL(blob);
      setImageUrl(url);

      // Revoke URL przy odmontowywaniu komponentu
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [buffer]);

  return (
    <div>
      {imageUrl && <img src={imageUrl} alt={alt || "Blob Image"} />}
    </div>
  );
}

export default ImageDisplay;
