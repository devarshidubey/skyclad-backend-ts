export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])[A-Za-z\d !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{8,}$/;
export const URL_REGEX = /^(https?:\/\/[^\s$.?#].[^\s]*)$/i;
export const FILENAME_REGEX = /^[a-zA-Z0-9 _.-]{1,100}$/;
export const TAG_REGEX = /^[a-zA-Z0-9_]{1,50}$/;

