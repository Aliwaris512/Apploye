import { toast } from 'react-toastify';

export const handleApiError = (error, customMessage = null) => {
  console.error('API Error:', error);
  
  let message = customMessage || 'An error occurred';
  let details = '';
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        message = 'Bad Request';
        details = data.message || 'The request was malformed';
        break;
      case 401:
        message = 'Unauthorized';
        details = 'Please log in to continue';
        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
        break;
      case 403:
        message = 'Forbidden';
        details = 'You do not have permission to perform this action';
        break;
      case 404:
        message = 'Not Found';
        details = 'The requested resource was not found';
        break;
      case 422:
        message = 'Validation Error';
        details = data.errors ? Object.values(data.errors).join(' ') : 'Invalid data provided';
        break;
      case 429:
        message = 'Too Many Requests';
        details = 'Please wait before making another request';
        break;
      case 500:
        message = 'Server Error';
        details = 'An unexpected error occurred on the server';
        break;
      default:
        message = `Error: ${status}`;
        details = data.message || 'An error occurred';
    }
  } else if (error.request) {
    // The request was made but no response was received
    message = 'Network Error';
    details = 'Unable to connect to the server. Please check your internet connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    message = 'Request Error';
    details = error.message || 'An error occurred while setting up the request';
  }
  
  // Show error toast
  toast.error(
    <div>
      <div className="font-bold">{message}</div>
      {details && <div className="text-sm">{details}</div>}
    </div>,
    { autoClose: 5000 }
  );
  
  // For form validation errors, return the validation errors
  if (error.response?.status === 422 && error.response.data?.errors) {
    return error.response.data.errors;
  }
  
  return { message, details };
};

export const handleSuccess = (message = 'Operation completed successfully') => {
  toast.success(message, { autoClose: 3000 });
};

export const handleInfo = (message) => {
  toast.info(message, { autoClose: 3000 });
};

export const handleWarning = (message) => {
  toast.warning(message, { autoClose: 5000 });
};

// Format validation errors for form fields
export const formatValidationErrors = (errors) => {
  if (!errors) return {};
  
  const formatted = {};
  
  Object.entries(errors).forEach(([field, messages]) => {
    // Convert field names from snake_case to camelCase for React Hook Form
    const fieldName = field
      .split('_')
      .map((word, i) => 
        i === 0 
          ? word 
          : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join('');
      
    formatted[fieldName] = {
      type: 'manual',
      message: Array.isArray(messages) ? messages[0] : messages,
    };
  });
  
  return formatted;
};

// Handle file upload errors
export const handleFileUploadError = (error) => {
  if (error.code) {
    switch (error.code) {
      case 'FILE_TOO_LARGE':
        return 'File is too large. Maximum file size is 10MB.';
      case 'INVALID_FILE_TYPE':
        return 'Invalid file type. Please upload a valid file.';
      case 'UPLOAD_FAILED':
        return 'File upload failed. Please try again.';
      default:
        return 'An error occurred while uploading the file.';
    }
  }
  return 'An error occurred while uploading the file.';
};
