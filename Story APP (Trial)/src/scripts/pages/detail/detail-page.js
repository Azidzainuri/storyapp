import {
  generateLoadingAbsolute,
  generateremoveBookmark,
  generateDetailStoriesError,
  generateDetailstories,
  generateBookmark,
} from '../../templates';
import { createCarousel, notification } from '../../utils';
import DetailPresenter from './detail-presenter';
import { parseActivePathname } from '../../routes/url-parser';
import Map from '../../utils/map';
import * as storiesAPI from '../../data/api';
import Database from '../../data/database';

export default class DetailPage {
  #presenter = null;
  #map = null;

  async render() {
    return `
      <section>
        <div class="stories-detail-container">
          <div id="stories-detail" class="stories-detail"></div>
          <div id="stories-detail-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new DetailPresenter(parseActivePathname().id, {
      view: this,
      apiModel: storiesAPI,
      dbModel: Database,
    });
    this.#presenter.showStoriesDetail();
  }

  async populateStoriesDetailinitialMap(message, story) {
    console.log(story)
    document.getElementById('stories-detail').innerHTML = generateDetailstories({
        id: story.id,
        name: story.name,
        description: story.description,
        photoUrl: story.photoUrl,
        createdAt: story.createdAt,
        location: story.location,
        lat: story.lat,
        lon: story.lon
    });

    // Carousel images
    createCarousel(document.getElementById('images'));

    // Map
    await this.#presenter.showDetailStoriesMap();

    if (this.#map) {
        if (story.lat !== null && story.lon !== null){
            const reportCoordinate = [story.lat, story.lon];
            const markerOptions = { alt: story.name };
            const popupOptions = { content: story.name };
            this.#map.changeCamera(reportCoordinate);
            this.#map.addMarker(reportCoordinate, markerOptions, popupOptions);
        } else {
          notification('failed', 'Koordinat tidak ditemukan, lokasi gagal dimuat!');
        }
    }

    // Actions buttons
    await this.#presenter.showSaveButton();
  }

  populatestoriesError(message) {
    document.getElementById('stories-detail').innerHTML = generateDetailStoriesError(message);
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 15,
    });
  }

  renderSaveButton() {
    document.getElementById('save-actions-container').innerHTML =
      generateBookmark();

    document.getElementById('story-detail-save').addEventListener('click', async () => {
      await this.#presenter.saveStory();
      await this.#presenter.showSaveButton();
    });
  }

  renderRemoveButton() {
    document.getElementById('save-actions-container').innerHTML =
      generateremoveBookmark();

    document.getElementById('story-detail-remove').addEventListener('click', async () => {
      await this.#presenter.removeStory();
      await this.#presenter.showSaveButton();
    });
  }

  saveToBookmarkSuccessfully(message) {
    notification('success', message);
  }

  saveToBookmarkFailed(message) {
    notification('failed', message);
  }

  removeFromBookmarkSuccessfully(message) {
    notification('success', message);
  }
  removeFromBookmarkFailed(message) {
    notification('failed', message);
  }

  showStoriesDetailLoading() {
    document.getElementById('stories-detail-loading-container').innerHTML =
      generateLoadingAbsolute();
  }

  hideDetailLoading() {
    document.getElementById('stories-detail-loading-container').innerHTML = '';
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = generateLoadingAbsolute();
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }
}
