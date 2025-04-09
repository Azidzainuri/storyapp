export default class AddPresenter {
    #view;
    #model;
  
    constructor({ view, model }) {
      this.#view = view;
      this.#model = model;
    }
  
    async shownewForm() {
      this.#view.showMapLoading();
      try {
        await this.#view.initialMap();
      } catch (error) {
        console.error('shownewForm: error:', error);
      } finally {
        this.#view.hideMapLoading();
      }
    }
  
    async postAddStories({ description, photo, lat, lon }) {
      this.#view.showSubmitLoadingButton();
      try {
        const data = {
          description: description,
          photo: photo,
          lat: lat,
          lon: lon
        };
        const response = await this.#model.storiesAdd(data);
  
        if (!response.ok) {
          console.error('postAddStories: response:', response);
          this.#view.storeFailed(response.message);
          return;
        }
  
        this.#view.storeSuccessfully(response.message, response.data);
      } catch (error) {
        console.error('postAddStories: error:', error);
        this.#view.storeFailed(error.message);
      } finally {
        this.#view.hideSubmitLoadingButton();
      }
    }
}
  