import RegisterPresenter from './register-presenter';
import * as storiesAPI from '../../../data/api';
import { fadeIn, fadeOut, notification, showPassword } from '../../../utils';

export default class RegisterPage {
  #presenter = null;

  async render() {
    return `
      <section class="register-container container">
        <article class="register-form-container">
          <h1 class="register-title center">Regiter</h1>
          <form id="form-register" class="form-register form-content">
            <div class="dataform">
                <label for="name-input">Your Name</label>
                <input id="name-input" type="text" name="name" placeholder="Input Your Name">
            </div>
            <div class="dataform">
                <label for="email-input">Email</label>
                <input id="email-input" type="email" name="email" placeholder="Example: example@email.com">
            </div>
            <div class="dataform">
                <label for="password-input">Password</label>
                <input id="password-input" type="password" name="password" placeholder="Input Password Here">
                <span class="show-password">
                    <svg class="icon-hidden" viewBox="0 0 24 24">
                        <path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z" fill="currentColor"></path>
                    </svg>
                    <svg class="icon-show hidden" viewBox="0 0 24 24">
                        <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" fill="currentColor"></path>
                    </svg>
                </span>
            </div>
            <div id="submit-button-container">
                <button class="button" type="submit" role="button">
                    <span>
                        <i class="fas fa-plus"></i>
                        <span class="text">Create Account</span>
                    </span>
                </button>
            </div>
            <p class="text-account">Already have an account? <a href="#/login">Login</a></p>
          </form>
        </article>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({
      view: this,
      model: storiesAPI,
    });

    this.#setupForm();
    this.#setupPassword();
  }

  #setupForm() {
    document.getElementById('form-register').addEventListener('submit', async (event) => {
      event.preventDefault();

      const data = {
        name: document.getElementById('name-input').value,
        email: document.getElementById('email-input').value,
        password: document.getElementById('password-input').value,
      };
      await this.#presenter.getRegistered(data);
    });
  }

  #setupPassword() {
    document.querySelector("form .show-password").addEventListener("click", function(event) {
      this.querySelector(".icon-hidden").classList.toggle("hidden");
      this.querySelector(".icon-show").classList.toggle("hidden");
      showPassword("#password-input");
      event.preventDefault();
    });
  }

  registeredSuccessfully(message) {
    notification("success", message);

    // Redirect
    location.hash = '/login';
  }

  registeredFailed(message) {
    notification("failed", message);
  }

  loadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="button" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Create Account
      </button>
    `;
  }

  hideloadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
        <button class="button" type="submit" role="button">
            <span>
                <i class="fas fa-plus"></i>
                <span class="text">Create Account</span>
            </span>
        </button>
    `;
  }
}
