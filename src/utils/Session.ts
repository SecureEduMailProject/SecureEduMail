import Cookies from 'js-cookie';

const setSessionToken = (token: string) => {
    Cookies.set('authToken', token, { expires: 1 / 24 }); // expire in 1 hour
};

const getAuthToken = (): string | undefined => {
    return Cookies.get('authToken');
};

const destroySession = () => {
    Cookies.remove('authToken');
};

export { setSessionToken, getAuthToken, destroySession };
