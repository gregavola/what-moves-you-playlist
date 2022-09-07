const { peloton } = require('peloton-client-node');

const authLogin = async (apiCookie: string) => {
  peloton.setToken(apiCookie);

  const sessionData = await peloton.validSession();
  if (sessionData.status === 200 && !sessionData.data.is_valid) {
    throw new Error('Not Authorized. Please try again.');
  }
  return peloton;
};

export default authLogin;
