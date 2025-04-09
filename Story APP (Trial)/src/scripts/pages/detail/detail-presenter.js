import { storiesMapper } from '../../data/api-mapper';

export default class DetailPresenter {
  #storiesId;
  #view;
  #apiModel;
  #dbModel;

  constructor(storiesId, { view, apiModel, dbModel }) {
    this.#storiesId = storiesId;
    this.#view = view;
    this.#apiModel = apiModel;
    this.#dbModel = dbModel;
  }

  async showDetailStoriesMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showDetailStoriesMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async showStoriesDetail() {
    this.#view.showStoriesDetailLoading();
    try {
      const response = await this.#apiModel.getStoriesDetail(this.#storiesId);

      if (!response.ok) {
        console.error('showStoriesDetailAndMap: response:', response);
        this.#view.populatestoriesError(response.message);
        return;
      }
      const stories = await storiesMapper(response.story);
      this.#view.populateStoriesDetailinitialMap(response.message, stories);
    } catch (error) {
      console.error('showStoriesDetailAndMap: error:', error);
      this.#view.populatestoriesError(error.message);
    } finally {
      this.#view.hideDetailLoading();
    }
  }

  async saveStory() {
    try {
      const story = await this.#apiModel.getStoriesDetail(this.#storiesId);
      await this.#dbModel.putStories(story.story);
      this.#view.saveToBookmarkSuccessfully('Success to save to bookmark');
    } catch (error) {
      console.error('saveReport: error:', error);
      this.#view.saveToBookmarkFailed(error.message);
    }
  }

  async removeStory() {
    try {
      await this.#dbModel.removeStories(this.#storiesId);
      this.#view.removeFromBookmarkSuccessfully('Success to remove from bookmark');
    } catch (error) {
      console.error('removeReport: error:', error);
      this.#view.removeFromBookmarkFailed(error.message);
    }
  }

  async showSaveButton() {
    if (await this.#isStoriesSaved()) {
      this.#view.renderRemoveButton();
      return;
    }
  
    this.#view.renderSaveButton();
  }

  async #isStoriesSaved() {
    return !!(await this.#dbModel.getStoriesDetail(this.#storiesId));
  }
}
