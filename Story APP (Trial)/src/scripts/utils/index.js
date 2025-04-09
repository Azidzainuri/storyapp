import { Workbox } from 'workbox-window';

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function getSnippet(content) {
  return content.replace(/<[^>]+>/g, "").substring(0, 75) + "...";
}

export function convertParagraphs(text) {
  if (!text) return '';
  return text
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => `<p>${line.trim()}</p>`)
    .join('');
}

export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function setupSkipToContent(element, mainContent) {
  element.addEventListener('click', () => mainContent.focus());
}

export async function createCarousel(containerElement, options = {}) {
  const { tns } = await import('tiny-slider');

  return tns({
    container: containerElement,
    mouseDrag: true,
    swipeAngle: false,
    speed: 600,

    nav: true,
    navPosition: 'bottom',

    autoplay: false,
    controls: false,

    ...options,
  });
}

export function transitionHelper({ skipTransition = false, classNames = '', updateDOM }) {
  if (skipTransition || !document.startViewTransition) {
    const updateCallbackDone = Promise.resolve(updateDOM()).then(() => undefined);

    return {
      ready: Promise.reject(Error('View transitions unsupported')),
      domUpdated: updateCallbackDone,
      updateCallbackDone,
      finished: updateCallbackDone,
    };
  }

  const classNamesArray = classNames.split(/\s+/g).filter(Boolean);

  document.documentElement.classList.add(...classNamesArray);

  const transition = document.startViewTransition(updateDOM);

  transition.finished.finally(() => document.documentElement.classList.remove(...classNamesArray));

  return transition;
}

/**
 * Ref: https://stackoverflow.com/questions/18650168/convert-blob-to-base64
 */
export function convertBlobToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Ref: https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
 */
export function convertBase64ToBlob(base64Data, contentType = '', sliceSize = 512) {
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

export function convertBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Set Notifikasi Peringatan

export function notification(icon, o) {
  var timeout_notif;
  var information = document.getElementById("information");
  if (information) information.remove();
  
  clearTimeout(timeout_notif);

  let svg = "";
  if (icon == "success"){
    svg = "<div class='warning success'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20M16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z' /></svg></div>";
  } else if (icon == "failed"){
    svg = "<div class='warning failed'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z' /></svg></div>";
  }
  
  var newInformation = document.createElement("div");
  newInformation.id = "information";
  document.body.appendChild(newInformation);
  
  newInformation.innerHTML = svg + o;
  fadeIn(newInformation, 100);

  timeout_notif = setTimeout(function () {
      fadeOut(newInformation, 1000);
      setTimeout(function () {
          newInformation.remove();
      }, 1000);
  }, 4000);
}

export function boxConfirm(text, action, content, link) {
  let html = document.querySelector(".box-confirmation");
  if (html) html.remove();
  let svg = "<div class='warning failed'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z' /></svg></div>";
  var newConfirm = document.createElement("div");
  newConfirm.className = "box-confirmation";
  document.body.appendChild(newConfirm);
  
  newConfirm.innerHTML = `
  ${svg}
  <p>${text}</p>
  <div class="option-button">
     <button class="accept" role="button" type="button">Ok</button>
     <button class="cancel" role="button" type="button">Cancel</button>
  </div>
  `;
  fadeIn(newConfirm, 100);
  newConfirm.querySelector(".accept").addEventListener("click", function(event){
    event.preventDefault();
    if (typeof action === "function") action();
    if (content == "logout"){
      location.hash = link;
    } else {
      window.location.href = link;
    }
    newConfirm.remove();
  });
  newConfirm.querySelector(".cancel").addEventListener("click", function(event){
    event.preventDefault();
    newConfirm.remove();
  });
}

export function fadeIn(element, duration) {
  var opacity = 0;
  var interval = 10;
  var gap = interval / duration;

  function fadeInLoop() {
      opacity += gap;
      element.style.opacity = opacity;

      if (opacity >= 1) {
          element.style.display = 'block'; // Change display to block when opacity reaches 1
          clearInterval(fadeInterval);
      }
  }

  var fadeInterval = setInterval(fadeInLoop, interval);
}

export function fadeOut(element, duration) {
  var opacity = 1;
  var interval = 10;
  var gap = interval / duration;

  function fadeOutLoop() {
      opacity -= gap;
      element.style.opacity = opacity;

      if (opacity <= 0) {
          clearInterval(fadeInterval);
          element.style.display = 'none'; // Change display to none when opacity reaches 0
          element.remove(); // Optionally, remove the element from the DOM
      }
  }

  var fadeInterval = setInterval(fadeOutLoop, interval);
};

export function showPassword(item) {
  var temp = document.querySelector(item);
  if (temp.getAttribute('type') === 'password') {
    temp.setAttribute('type', 'text');
  } else {
    temp.setAttribute('type', 'password');
  }
}

export function isServiceWorkerAvailable() {
  return 'serviceWorker' in navigator;
}
 
export async function registerServiceWorker() {
  if (!isServiceWorkerAvailable()) {
    console.log('🚫 Service Worker tidak didukung di browser ini.');
    return;
  }

  try {
    const wb = new Workbox('/sw.js'); // pastikan path sesuai hasil build
    wb.addEventListener('waiting', () => {
      console.log('⚠️ Update service worker tersedia. Akan diaktifkan setelah reload.');
    });

    wb.addEventListener('activated', (event) => {
      if (event.isUpdate) {
        console.log('🔄 Service worker diperbarui.');
      } else {
        console.log('✅ Service worker pertama kali diaktifkan.');
      }
    });

    await wb.register();
    console.log('🚀 Service worker berhasil didaftarkan!');
  } catch (err) {
    console.error('❌ Gagal mendaftarkan service worker:', err);
  }
}

