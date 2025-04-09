import AddPresenter from './add-presenter';
import { convertBase64ToBlob } from '../../utils';
import * as storiesAPI from '../../data/api';
import { generateLoadingAbsolute} from '../../templates';
import Camera from '../../utils/camera';
import Map from '../../utils/map';

export default class AddPage {
  #presenter;
  #form;
  #camera;
  #isCameraOpen = false;
  #takenDocumentations = [];
  #map = null;

  async render() {
    return `
      <section>
        <div class="add-page-header">
          <div class="container">
            <h1 class="title center">Add Stories</h1>
            <p class="description-header">
              Yuk buat cerita dengan mengisi form dibawah ini.
            </p>
          </div>
        </div>
      </section>
  
      <section class="container">
        <div class="form-container">
          <form id="add-form" class="form-content add-form">
            <div class="dataform">
                <label for="description-input">Your Story</label>
                <textarea
                  id="description-input"
                  name="description"
                  placeholder="Input Your Story Here."
                ></textarea>
            </div>
            <div class="dataform">
              <label for="documentations-input">Story Image</label>
              <div id="documentations-more-info">Anda dapat menyertakan foto sebagai pelengkap cerita Anda.</div>
  
              <div class="documentation-container">
                <div class="documentation-buttons">
                  <button id="documentations-input-button" class="button" type="button">
                    Ambil Gambar
                  </button>
                  <input
                    id="documentations-input"
                    name="documentations"
                    type="file"
                    accept="image/*"
                    hidden="hidden"
                    aria-multiline="true"
                    aria-describedby="documentations-more-info"
                  >
                  <button id="open-documentations-camera-button" class="button" type="button">
                    Buka Kamera
                  </button>
                </div>
                <div id="camera-container" class="camera-container">
                  <video id="camera-video" class="camera-video">
                    Video stream not available.
                  </video>
                  <canvas id="camera-canvas" class="camera-canvas hidden"></canvas>
  
                  <div class="camera-tools">
                    <select id="camera-select"></select>
                    <div class="camera-tools-buttons">
                      <button id="camera-take-button" class="button" type="button">
                        Ambil Gambar
                      </button>
                    </div>
                  </div>
                </div>
                <ul id="documentations-taken-list" class="documentation-outputs"></ul>
              </div>
            </div>
            <div class="dataform">
              <div class="title-location">Lokasi</div>
              <div class="location-container">
                <div class="location-map">
                  <div id="map" class="box-map"></div>
                  <div id="map-loading-container"></div>
                </div>
                <div class="dataform location-input">
                  <input type="number" aria-label="latitude" id="add-lat" name="latitude" value="-6.175389" disabled>
                  <input type="number" aria-label="longitude" id="add-lon" name="longitude" value="106.827139" disabled>
                </div>
              </div>
            </div>
            <div class="option-button">
              <span id="submit-button-container">
                <button class="button" type="submit"><i class="fas fa-plus"></i> Create Story</button>
              </span>
              <a class="link" href="#/">Cancel</a>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new AddPresenter({
      view: this,
      model: storiesAPI,
    });
    this.#takenDocumentations = [];

    this.#presenter.shownewForm();
    this.#setupForm();
  }

  #setupForm() {
    this.#form = document.getElementById('add-form');
    this.#form.addEventListener('submit', async (event) => {
      event.preventDefault();

      // Photo With Arry
      //this.#takenDocumentations.map((picture) => picture.blob)
      const data = {
        description: this.#form.elements.namedItem('description').value,
        photo: this.#takenDocumentations[0]?.blob || null,
        lat: this.#form.elements.namedItem('latitude').value,
        lon: this.#form.elements.namedItem('longitude').value,
      };
      await this.#presenter.postAddStories(data);
    });

    document.getElementById('documentations-input').addEventListener('change', async (event) => {
      const insertingPicturesPromises = Object.values(event.target.files).map(async (file) => {
        return await this.#addTakenPicture(file);
      });
      await Promise.all(insertingPicturesPromises);

      await this.#populateTakenPictures();
    });

    document.getElementById('documentations-input-button').addEventListener('click', () => {
      this.#form.elements.namedItem('documentations-input').click();
    });

    const cameraContainer = document.getElementById('camera-container');
    document.getElementById('open-documentations-camera-button').addEventListener('click', async (event) => {
        cameraContainer.classList.toggle('open');
        this.#isCameraOpen = cameraContainer.classList.contains('open');
        let content = cameraContainer;
        if (content.style.display === 'none' || content.style.display === '') {
            content.style.display = 'flex';
            var height = content.scrollHeight + 'px';
            content.style.maxHeight = height;
            setTimeout(function() {
               content.style.maxHeight = 'none';
            }, 500);
         } else {
            content.style.maxHeight = content.scrollHeight + 'px';
            setTimeout(function() {
               content.style.maxHeight = '0';
               setTimeout(function() {
                  content.style.display = 'none';
               }, 500);
            }, 10);
         }
        if (this.#isCameraOpen) {
          event.currentTarget.textContent = 'Tutup Kamera';
          this.#setupCamera();
          await this.#camera.launch();

          return;
        }

        event.currentTarget.textContent = 'Buka Kamera';
        this.#camera.stop();
      });
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 15,
      locate: true,
    });
    const centerCoordinate = this.#map.getCenter();
    this.#updateLatLngInput(centerCoordinate.latitude, centerCoordinate.longitude);
    const draggableMarker = this.#map.addMarker(
      [centerCoordinate.latitude, centerCoordinate.longitude],
      { draggable: 'true' },
    );
    draggableMarker.addEventListener('move', (event) => {
      const coordinate = event.target.getLatLng();
      this.#updateLatLngInput(coordinate.lat, coordinate.lng);
    });
    this.#map.addMapEventListener('click', (event) => {
      draggableMarker.setLatLng(event.latlng);
      event.sourceTarget.flyTo(event.latlng);
    });
  }

  #updateLatLngInput(latitude, longitude) {
    this.#form.elements.namedItem('latitude').value = latitude;
    this.#form.elements.namedItem('longitude').value = longitude;
  }

  #setupCamera() {
    if (!this.#camera) {
      this.#camera = new Camera({
        video: document.getElementById('camera-video'),
        cameraSelect: document.getElementById('camera-select'),
        canvas: document.getElementById('camera-canvas'),
      });
    }

    this.#camera.addCheeseButtonListener('#camera-take-button', async () => {
      const image = await this.#camera.takePicture();
      await this.#addTakenPicture(image);
      await this.#populateTakenPictures();
    });
  }

  async #addTakenPicture(image) {
    let blob = image;

    if (image instanceof String) {
      blob = await convertBase64ToBlob(image, 'image/png');
    }

    const newDocumentation = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      blob: blob,
    };
    //Multiple Image
    //this.#takenDocumentations = [...this.#takenDocumentations, newDocumentation];
    // Singgle Images
    this.#takenDocumentations = [newDocumentation];
  }

  async #populateTakenPictures() {
    const html = this.#takenDocumentations.reduce((accumulator, picture, currentIndex) => {
      const imageUrl = URL.createObjectURL(picture.blob);
      return accumulator.concat(`
        <li class="documentation-outputs-item">
          <button type="button" data-deletepictureid="${picture.id}" class="delete">
            <img src="${imageUrl}" alt="Dokumentasi ke-${currentIndex + 1}">
          </button>
        </li>
      `);
    }, '');

    document.getElementById('documentations-taken-list').innerHTML = html;

    document.querySelectorAll('button[data-deletepictureid]').forEach((button) =>
      button.addEventListener('click', (event) => {
        const pictureId = event.currentTarget.dataset.deletepictureid;

        const deleted = this.#removePicture(pictureId);
        if (!deleted) {
          console.log(`Picture with id ${pictureId} was not found`);
        }

        // Updating taken pictures
        this.#populateTakenPictures();
      }),
    );
  }

  #removePicture(id) {
    const selectedPicture = this.#takenDocumentations.find((picture) => {
      return picture.id == id;
    });

    // Check if founded selectedPicture is available
    if (!selectedPicture) {
      return null;
    }

    // Deleting selected selectedPicture from takenPictures
    this.#takenDocumentations = this.#takenDocumentations.filter((picture) => {
      return picture.id != selectedPicture.id;
    });

    return selectedPicture;
  }

  storeSuccessfully(message) {
    console.log(message);
    this.clearForm();

    // Redirect page
    location.hash = '/';
  }

  storeFailed(message) {
    alert(message);
  }

  clearForm() {
    this.#form.reset();
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = generateLoadingAbsolute();
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }

  showSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Create Story
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn" type="submit"><i class="fas fa-plus"></i> Create Story</button>
    `;
  }
}
