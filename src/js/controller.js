// https://forkify-api.herokuapp.com/v2
import * as model from './model.js'
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;

    // 1) Render spinner
    recipeView.renderSpinner();

    // 2) Update results view to mark selected.
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks)

    // 2) Loading recipe
    await model.loadRecipe(id);

    // 3) Rendering recipe
    recipeView.render(model.state.recipe);

  } catch (err) {
    console.log(err);
    recipeView.renderError();
  }
}

const controlSearchResults = async function () {
  try {
    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Render spinner loading.
    resultsView.renderSpinner();


    // 3) Load search results.
    await model.loadSearchResults(query);

    // 4) Render result.
    //resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage())

    // 5) Render initial pagination buttons
    paginationView.render(model.state.search);

  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // 3) Render NEW result.
  resultsView.render(model.getSearchResultsPage(goToPage))

  // 4) Render NEW initial pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings 
  model.updateServings(newServings);

  // Updata the view
  //recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add or remove a bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }

  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
}

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function (newRecipe) {
  try {
    //show loading spinner
    addRecipeView.renderSpinner();

    //Await uploadRecipe
    await model.uploadRecipe(newRecipe);

    //Render recipe
    recipeView.render(model.state.recipe);

    //Succes message
    addRecipeView.renderMessage();

    //Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //Change id URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`)

    //Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    addRecipeView.renderError(err.message)
  }

}

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark)
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView._addHandlerUpload(controlAddRecipe);
};

init();