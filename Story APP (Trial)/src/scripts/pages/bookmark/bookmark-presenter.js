import { storiesMapper } from '../../data/api-mapper';

export default class BookmarkPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showlistMap() {
    // for map
  }

  async initialStories() {
    await this.loadStories();
  }

  async loadStories() {
    this.#view.showLoading();
    try {
      await this.showlistMap();
      const response = await this.#model.getAllStories();
      const stories = await Promise.all(response.map(storiesMapper));
      const message = 'Berhasil mendapatkan daftar laporan tersimpan.';
      this.#view.bookmarkStories(message, stories);
    } catch (error) {
      this.#view.listIsError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }

  async removeStory(id) {
    try {
      await this.#model.removeStories(id);
    } catch (error) {
      console.error('removeReport: error:', error);
    }
  }
}