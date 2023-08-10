import FileSystemError from './FileSystemError.js';
import NetworkError from './NetworkError.js';

const handleError = (error) => {
  console.error(error.message);
  switch (error.code) {
    case 'ENOENT':
      throw new FileSystemError('FILE_NOT_FOUND_ERROR');
    case 'EACCES':
      throw new FileSystemError('PERMISSION_DENIED_ERROR');
    case 'EEXIST':
      throw new FileSystemError('FILE_OR_DIR_EXISTS_ERROR');
    case 111:
      throw new NetworkError('CONNECTION_REFUSED_ERROR');
    case 404:
      throw new NetworkError('IP_NOT_FOUND_ERROR');
    default:
      throw new FileSystemError('UNKNOWN_ERROR');
  }
};

export default handleError;
