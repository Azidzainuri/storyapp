import { showFormattedDate, getSnippet, convertParagraphs } from './utils';
export function generateloading() {
    return `
      <div class="loader"></div>
    `;
}
  
export function generateLoadingAbsolute() {
    return `
      <div class="loader loader-absolute"></div>
    `;
}
  
export function navigationAfterLogin() {
    return `
      <li id="push-notification-tools" class="push-notification-tools"></li>
      <li><a id="installBtn" href="javscript:;" style="display: none;"><i class="fas fa-mobile-alt"></i> Install App</a></li>
      <li><a id="stories-list-button" class="stories-list-button" href="#/"><i class="fas fa-list"></i> Story List</a></li>
      <li><a id="bookmark-button" class="bookmark-button" href="#/bookmark"><i class="fas fa-bookmark"></i> My Bookmark</a></li>
      <li><a id="add-story-button" class="btn add-story-button" href="#/add"><i class="fas fa-plus"></i> Add Story</a></li>
      <li><a id="logout-button" class="logout-button" href="#/logout"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
    `;
}
  
export function navigationBeforeLogin() {
    return `
      <li><a id="installBtn" href="javascript:;" style="display: none;"><i class="fas fa-mobile-alt"></i> Install App</a></li>
      <li><a id="login-button" href="#/login"><i class="fas fa-sign-in-alt"></i> Login</a></li>
      <li><a id="register-button" href="#/register"><i class="fas fa-plus"></i> Register</a></li>
    `;
}
  
export function generateStoriesEmpty() {
    return `
      <div id="story-list-empty" class="story-list-empty story-incorrect">
        <h2>Belum ada story apapun disini</h2>
        <p>Saat ini, tidak ada story yang dapat ditampilkan.</p>
      </div>
    `;
}
  
export function generateStoriesError(message) {
    return `
      <div id="story-list-error" class="story-list-error story-incorrect">
        <h2>Terjadi kesalahan pengambilan daftar story</h2>
        <p>${message ? message : 'Gunakan jaringan lain atau laporkan error ini.'}</p>
      </div>
    `;
}
  
export function generateDetailStoriesError(message) {
    return `
      <div id="story-detail-error" class="story-detail-error story-incorrect">
        <h2>Terjadi kesalahan pengambilan postingan story ini</h2>
        <p>${message ? message : 'Gunakan jaringan lain atau laporkan error ini.'}</p>
      </div>
    `;
}

export function generateListStories({
  id,
  name,
  description,
  photoUrl,
  createdAt,
  location
}) {
  return `
    <div tabindex="0" class="story-item" data-reportid="${id}">
      <div class="item-thumbnail">
        <div class="button-bookmark"></div>
        <img class="item-image" src="${photoUrl}" alt="${name}">
      </div>
      <div class="item-body">
        <div class="item-main">
          <h2 class="item-name">${name}</h2>
          <div class="item-info">
            <div class="item-createdat">
              <i class="far fa-calendar"></i></i> ${showFormattedDate(createdAt, 'id-ID')}
            </div>
            <div class="item-location">
              <i class="fas fa-map-marker-alt"></i></i> ${location.placeName}
            </div>
          </div>
        </div>
        <div class="item-description">
          ${getSnippet(description)}
        </div>
        <a class="btn read-more" href="#/stories/${id}">
          Read More <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    </div>
  `;
}

export function generateImage(imageUrl = null, alt = '') {
    if (!imageUrl) {
      return `
        <img class="detail-image" src="images/placeholder-image.jpg" alt="Placeholder Image">
      `;
    }
  
    return `
      <img class="detail-image" src="${imageUrl}" alt="${alt}">
    `;
}

export function generateDetailstories({
    id,
    name,
    description,
    photoUrl,
    createdAt,
    location,
    lat,
    lon
}) {
  const createdAtFormatted = showFormattedDate(createdAt, 'id-ID');
  const imagesHtml = generateImage(photoUrl, name);

  return `
    <div class="story-detail-header" data-id="${id}">
      <h1 class="detail-name">${name}</h1>

      <div class="detail-info">
        <div class="info-grid">
          <div class="detail-createdat" data-value="${createdAtFormatted}"><i class="far fa-calendar"></i></div>
          <div class="detail-location" data-value="${location.placeName}"><i class="fas fa-map-marker-alt"></i></div>
        </div>
        <div class="info-grid">
          <div class="detail-lat" data-value="${lat}">Lat:</div>
          <div class="detail-lon" data-value="${lon}">Lng:</div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="image-container">
        <div id="images" class="detail-images">${imagesHtml}</div>
      </div>
    </div>

    <div class="container">
      <div class="detail-body">
        <div class="detail-body-container">
          <h2 class="detail-body-title">My Story</h2>
          <div class="detail-body-description">
            ${convertParagraphs(description)}
          </div>
        </div>
        <div class="detail-location-outer">
          <h2 class="detail-location-title">Location</h2>
          <div class="detail-location-container">
            <div id="map" class="map-location"></div>
            <div id="map-loading-container"></div>
          </div>
        </div>
        <div class="detail-action">
          <h2>Action</h2>
          <div class="detail-action-button">
            <div id="save-actions-container"></div>
            <div id="notify-me-actions-container">
              <button id="detail-notify-me" class="btn btn-transparent">
                Try Notify Me <i class="far fa-bell"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function generateSubcribe() {
    return `
      <button id="subscribe-button" class="btn subscribe-button">
        Subscribe <i class="fas fa-bell"></i>
      </button>
    `;
}

export function generateUnsubscribe() {
    return `
      <button id="unsubscribe-button" class="btn subscribe-button">
        Unsubscribe <i class="fas fa-bell-slash"></i>
      </button>
    `;
}

export function generateBookmark() {
    return `
      <button id="story-detail-save" class="btn btn-transparent">
        Save <i class="far fa-bookmark"></i>
      </button>
    `;
}
  
export function generateremoveBookmark() {
    return `
      <button id="story-detail-remove" class="btn btn-transparent">
        Unsave <i class="fas fa-bookmark"></i>
      </button>
    `;
}