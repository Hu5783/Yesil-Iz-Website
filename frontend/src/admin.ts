import { postData, fetchData} from "./api";

const form = document.querySelector<HTMLFormElement>('#login-form');
if (!form) {
  throw new Error('Login form not found');
}
const data = new FormData(form);
const email = data.get('email');
