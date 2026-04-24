export default function getApiErrorMessage(error, fallbackMessage) {
  const responseMessage = error?.response?.data?.message;
  const responseDetails = error?.response?.data?.error;

  if (responseMessage && responseDetails) {
    return `${responseMessage}: ${responseDetails}`;
  }

  if (responseMessage) {
    return responseMessage;
  }

  if (error?.code === 'ERR_NETWORK' || !error?.response) {
    return 'Cannot reach the server. Check your Vercel API URL and backend deployment.';
  }

  return fallbackMessage;
}
