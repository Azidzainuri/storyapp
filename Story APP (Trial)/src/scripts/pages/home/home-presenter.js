import { storiesMapper } from '../../data/api-mapper';

export default class HomePresenter {
  #view;
  #model;
  #currentPage = 1;
  #isEndOfList = false;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showlistMap() {
    // for map
  }

  async initialStories() {
    this.#currentPage = 1;
    this.#isEndOfList = false;
    await this.loadStories();
  }

  async loadStories() {
    if (this.#isEndOfList) return;

    this.#view.showLoading();
    try {
      await this.showlistMap();
      const response = await this.#model.getAllStories(this.#currentPage);
      if (!response.ok) {
        const stories = await Promise.all(response.listStory.map(storiesMapper));
        this.#view.appendStories(response.message, stories);
        return;
      }
      const stories = await Promise.all(response.listStory.map(storiesMapper));
      this.#view.appendStories(response.message, stories);

      // Check if listStory.length < 10, berarti sudah terakhir
      if (response.listStory.length < 10) {
        this.#isEndOfList = true;
        this.#view.hideLoadMoreButton();
      } else {
        this.#currentPage++;
        this.#view.showLoadMoreButton();
      }
    } catch (error) {
      this.#view.listIsError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
