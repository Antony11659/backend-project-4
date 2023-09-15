import FileSystemError from './FileSystemError.js';
import NetworkError from './NetworkError.js';

const errorStatusMessages = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  405: 'METHOD_NOT_ALLOWED',
  406: 'NOT_ACCEPTABLE',
  408: 'REQUEST_TIMEOUT',
  429: 'TOO_MANY_REQUESTS',
  500: 'INTERNAL_SERVER_ERROR',
  501: 'NOT_IMPLEMENTED',
  503: 'SERVICE_UNAVAILABLE',
  504: 'GATEWAY_TIMEOUT',
};

const handleError = (error) => {
  const { message, response, code } = error;
  if (code === 'ENOENT' || code === 'EACCES' || code === 'ECONNREFUSED' || code === 'EROFS') {
    throw new FileSystemError(message);
  }

  if (response) {
    const { status } = response;
    const errorMessage = errorStatusMessages[status];
    throw new NetworkError(errorMessage);
  }

  throw new Error(message ?? 'UNKNOWN_ERROR');
};

export default handleError;
