export default function getApiErrorMessage(error, fallbackMessage) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.code === 'ERR_NETWORK' || !error?.response) {
    return 'Cannot reach the server. Check your Vercel API URL and backend deployment.';
  }

  return fallbackMessage;
}
