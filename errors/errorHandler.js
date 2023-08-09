import FileSystemError from './FileSystemError.js';
import NetworkError from './NetworkError.js';

const handleError = (type, error) => {
  if (type === 'FILE_SYSTEM') {
    switch (error.code) {
      case 'ENOENT':
        throw new FileSystemError('FILE_NOT_FOUND_ERROR');
      case 'EACCES':
        throw new FileSystemError('PERMISSION_DENIED_ERROR');
      case 'EEXIST':
        throw new FileSystemError('FILE_OR_DIR_EXISTS_ERROR');
      default:
        throw new FileSystemError('FS_GENERIC_ERROR');
    }
  } else if (type === 'NETWORK') {
    switch (error.code) {
      case 111:
        throw new NetworkError('CONNECTION_REFUSED_ERROR');
      case 404:
        throw new NetworkError('IP_NOT_FOUND_ERROR');
      default:
        throw new NetworkError(`${'NETWORK_GENERIC_ERROR'}: ${error.message}`);
    }
  }
};

export default handleError;
