import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { setupSkipToContent, transitionHelper, boxConfirm, isServiceWorkerAvailable } from '../utils';
import { getAccessToken, getLogout } from '../utils/auth';
import { isCurrentPushSubscriptionAvailable, subscribe, unsubscribe } from '../utils/notification-helper';
import { navigationAfterLogin, navigationBeforeLogin, generateSubcribe, generateUnsubscribe } from '../templates';

export default class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #skipLinkButton = null;

  constructor({ navigationDrawer, drawerButton, content, skipLinkButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#skipLinkButton = skipLinkButton;

    this.#init();
  }
  #init(){
    setupSkipToContent(this.#skipLinkButton, this.#content);
    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      const isTargetInsideDrawer = this.#navigationDrawer.contains(event.target);
      const isTargetInsideButton = this.#drawerButton.contains(event.target);
      if (!isTargetInsideDrawer && !isTargetInsideButton) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      })
    });
  }

  #setupNavigationList(){
    const isLogin = !!getAccessToken();
    const navList = this.#navigationDrawer.children.namedItem('nav-list');

    // User not log in
    if (!isLogin) {
      navList.innerHTML = navigationBeforeLogin();
    } else {
      navList.innerHTML = navigationAfterLogin();
      if (isServiceWorkerAvailable()) {
        this.#setupPushNotification();
      }
      const logoutButton = document.getElementById('logout-button');
      logoutButton.addEventListener('click', (event) => {
        event.preventDefault();
        let text = 'Apakah Anda yakin ingin keluar?';
        let action = () => getLogout();
        let content = "logout";
        let link = '/login';
        boxConfirm(text, action, content, link);
      });
    }

    let deferredPrompt;
    const installBtn = document.getElementById('installBtn');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    if (!isStandalone) {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
  
        // Tampilkan tombol install
        installBtn.style.display = 'block';
  
        // Tangani klik tombol
        installBtn.addEventListener('click', async () => {
          installBtn.style.display = 'none'; // sembunyikan tombol
  
          deferredPrompt.prompt(); // tampilkan prompt install
          const choiceResult = await deferredPrompt.userChoice;
  
          if (choiceResult.outcome === 'accepted') {
            console.log('✅ User accepted the install prompt');
          } else {
            console.log('❌ User dismissed the install prompt');
          }
  
          deferredPrompt = null; // reset
        });
      });
      window.addEventListener('appinstalled', () => {
        console.log('🎉 App installed!');
        installBtn.style.display = 'none'; // sembunyikan tombol
      });
    }
  }

  async #setupPushNotification() {
    const pushNotificationTools = document.getElementById('push-notification-tools');
    const isSubscribed = await isCurrentPushSubscriptionAvailable();
    if (isSubscribed) {
      pushNotificationTools.innerHTML = generateUnsubscribe();
      document.getElementById('unsubscribe-button').addEventListener('click', () => {
        unsubscribe().finally(() => {
          this.#setupPushNotification();
        });
      });
      return;
    }
    pushNotificationTools.innerHTML = generateSubcribe();
    document.getElementById('subscribe-button').addEventListener('click', () => {
      subscribe().finally(() => {
        this.#setupPushNotification();
      });
    });
  }
    
  async renderPage() {
    const url = getActiveRoute();
    const route = routes[url];
    if (route !== undefined){
      const page = route();
      const transition = transitionHelper({
        updateDOM: async () => {
          this.#content.innerHTML = await page.render();
          page.afterRender();
        },
      });
      transition.ready.catch(console.error);
      transition.updateCallbackDone.then(() => {
        scrollTo({ top: 0, behavior: 'instant' });
        this.#setupNavigationList();
      });
    } else {
      let html = `
      <div class="error-page container">
      <h1>404</h1>
      <p>Sorry, Page Not Found</p>
      </div>
      `;
      const transition = transitionHelper({
        updateDOM: async () => {
          this.#content.innerHTML = html;
        },
      });
      transition.ready.catch(console.error);
      transition.updateCallbackDone.then(() => {
        scrollTo({ top: 0, behavior: 'instant' });
        this.#setupNavigationList();
      });
    }
  }
}
