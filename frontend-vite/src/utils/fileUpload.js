import { filesAPI } from '../api/apiService';

export const uploadFile = async (projectId, file, onProgress) => {
  try {
    const response = await filesAPI.upload(projectId, file, (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const downloadFile = async (projectId, fileId, fileName) => {
  try {
    const response = await filesAPI.download(projectId, fileId);
    
    // Create a blob from the response
    const url = window.URL.createObjectURL(new Blob([response.data]));
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    
    // Trigger the download
    link.click();
    
    // Clean up
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  
  const fileTypes = {
    // Images
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    bmp: 'image',
    webp: 'image',
    svg: 'image',
    
    // Documents
    pdf: 'picture_as_pdf',
    doc: 'description',
    docx: 'description',
    txt: 'description',
    rtf: 'description',
    
    // Spreadsheets
    xls: 'table_chart',
    xlsx: 'table_chart',
    csv: 'table_chart',
    
    // Presentations
    ppt: 'slideshow',
    pptx: 'slideshow',
    
    // Archives
    zip: 'folder_zip',
    rar: 'folder_zip',
    '7z': 'folder_zip',
    tar: 'folder_zip',
    gz: 'folder_zip',
    
    // Code
    js: 'code',
    jsx: 'code',
    ts: 'code',
    tsx: 'code',
    html: 'code',
    css: 'code',
    json: 'code',
    py: 'code',
    java: 'code',
    cpp: 'code',
    c: 'code',
    cs: 'code',
    php: 'code',
    rb: 'code',
    go: 'code',
    rs: 'code',
    
    // Default
    default: 'insert_drive_file',
  };
  
  return fileTypes[extension] || fileTypes.default;
};
