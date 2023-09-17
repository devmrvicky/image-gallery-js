// select all html element that we have need
const gallery = document.getElementById("gallery");
const main = document.querySelector("main#app");
const searchForm = document.querySelector("main#app form");
const categoriesList = document.querySelector(".all-categories ul");
const arrowIcons = document.querySelectorAll(".all-categories div i");
const filterList = document.querySelector(".filter ul");
// api url and api key
const URL = "https://pixabay.com/api/";
const API_KEY = "34657704-e04d20fd3f1dc0d6b82785a80";

// search filter
const searchFilter = {};

// all categories
const categories = [
  "backgrounds",
  "fashion",
  "nature",
  "science",
  "education",
  "feelings",
  "health",
  "people",
  "religion",
  "places",
  "animals",
  "industry",
  "computer",
  "food",
  "sports",
  "transportation",
  "travel",
  "buildings",
  "business",
  "music",
];

// get url
const getUrl = (searchQuery = "", category = "") => {
  return `${URL}?key=${API_KEY}${searchQuery}${category}`;
};

// get image data
const getImageData = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    return error;
  }
};

// remove light box element
const removeLightBoxElem = (e) => {
  if (e.target.classList.contains("light-box-container")) {
    e.target.remove();
  }
};

// download
const downloadImg = (src) => {
  const fileUrl = src;
  const fileName = "image.jpg";

  fetch(fileUrl)
    .then((response) => response.blob())
    .then((blob) => {
      // Create a Blob URL for the file
      const blobUrl = window.URL.createObjectURL(blob);
      // Create a temporary link element
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;

      // Trigger the download
      link.click();

      // Clean up: revoke the Blob URL
      window.URL.revokeObjectURL(blobUrl);
    });
};

const setImgSize = (e) => {
  const bigImgElement = e.currentTarget.parentElement.previousElementSibling;
  const img = bigImgElement.children[0];
  const sizeElement = bigImgElement.children[1];
  const width = e.target.getAttribute("data-width");
  const height = e.target.getAttribute("data-height");
  const src = e.target.getAttribute("data-src");
  if (e.target.nodeName === "DIV") {
    sizeElement.textContent = `${width}px x ${height}px`;
    if (width >= 1500 || height >= 1500) {
      img.style.width = `100%`;
      img.style.height = `100%`;
    } else {
      img.style.width = `${width}px`;
      img.style.height = `${height}px`;
    }
    img.setAttribute("src", src);
  } else {
    downloadImg(img.getAttribute("src"));
  }
};

// light box img
const lightBox = (img) => {
  const lightBoxElem = document.createElement("div");
  lightBoxElem.classList.add("light-box-container");
  const bigImg = document.createElement("div");
  bigImg.classList.add("big-img");
  bigImg.innerHTML = `
    <img src=${img.largeImageURL} alt="" style="aspect-ratio: ${img.imageWidth} / ${img.imageHeight};" >
    <span class="img-size">${img.imageWidth}px x ${img.imageHeight}px</span>
  `;
  const controlPanel = document.createElement("div");
  controlPanel.classList.add("img-control-panel");
  const user = document.createElement("div");
  user.classList.add("user");
  user.innerHTML = `
    <div class="user-img">
      <img src=${img.userImageURL} alt="">
    </div>
    <h3>${img.user}</h3>
  `;
  const downloadButtons = document.createElement("div");
  downloadButtons.classList.add("download-buttons");
  downloadButtons.innerHTML = `
    <div class="fullHd" data-width=${img.imageWidth} data-height=${img.imageHeight} data-src=${img.largeImageURL}>${img.imageWidth}px x ${img.imageHeight}px</div>
    <div class="halfHd" data-width=${img.webformatWidth} data-height=${img.webformatHeight} data-src=${img.webformatURL}>${img.webformatWidth}px x ${img.webformatHeight}px</div>
    <div class="lowHd" data-width=${img.previewWidth} data-height=${img.previewHeight} data-src=${img.previewURL}>${img.previewWidth}px x ${img.previewHeight}px</div>
    <button type="button">download image</button>
  `;

  downloadButtons.onclick = (e) => {
    setImgSize(e);
  };

  controlPanel.append(user);
  controlPanel.append(downloadButtons);
  lightBoxElem.append(bigImg);
  lightBoxElem.append(controlPanel);
  lightBoxElem.onclick = (e) => {
    removeLightBoxElem(e);
  };
  main.append(lightBoxElem);
  console.log(img);
};

// show image
const showImage = async (url) => {
  gallery.innerHTML = "";
  const imgData = await getImageData(url);
  if (imgData.message === "Failed to fetch") {
    gallery.innerHTML = `<div><button type="button" onclick="window.location.reload()">Reload the page</button></div>`;
  } else {
    if (imgData.hits.length !== 0) {
      for (let img of imgData.hits) {
        const imgContainer = document.createElement("div");
        if (img.webformatHeight >= 640) {
          imgContainer.style.gridRow = "span 2";
        }
        imgContainer.classList.add("img-container");
        // console.log(img.tags.split(', '))
        imgContainer.innerHTML = `
          <img src=${img.webformatURL} alt="" style="aspect-ratio: ${
          img.imageWidth
        } / ${img.imageHeight};">
          <div class="tags">
           ${img.tags.split(", ").map((tag) => `<span>#${tag.trim()}</span>`)}
          </div>
          <div class="ctrl-btns">
            <button type="button" class="downloadBtn">
              <i class="fa fa-download"></i>
            </button>
          </div>`;
        imgContainer.onclick = (e) => {
          if (e.target.nodeName === "BUTTON" || e.target.nodeName === "I") {
            downloadImg(
              e.currentTarget.querySelector("img").getAttribute("src")
            );
          }
          if (
            e.target.classList.contains("img-container") ||
            e.target.nodeName === "IMG"
          ) {
            lightBox(img);
          }
        };
        gallery.append(imgContainer);
      }
    } else {
      gallery.innerHTML = `<li class="no-img-found">no image found</li>`;
    }
  }
  showFilterButton();
};

// show image when document is loaded
showImage(getUrl());

// search image
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchInput = e.currentTarget.querySelector('input[type="search"]');
  const searchValue = searchInput.value;
  const searchQuery = `&q=${searchValue.trim().split(" ").join("+")}`;
  searchFilter.q = searchQuery;
  showImage(getUrl(searchFilter.q, searchFilter.category));
  searchInput.value = "";
});

// show all categories of image
const categoryItems = categories.map((category) => {
  const li = document.createElement("li");
  li.textContent = category;
  li.setAttribute("data-category", category);
  categoriesList.append(li);
  return li;
});

// image filter by categories
categoryItems.forEach((categoryItem) => {
  categoryItem.addEventListener("click", (e) => {
    const category = `&category=${e.currentTarget.getAttribute(
      "data-category"
    )}`;
    searchFilter.category = category;
    showImage(getUrl(searchFilter.q, searchFilter.category));
  });
});

// dragging category items
let isDragging = false;
const dragging = (px) => {
  categoriesList.scrollLeft -= px;
};
categoriesList.addEventListener("mousemove", (e) => {
  categoriesList.classList.remove("dragging");
  if (!isDragging) return;
  dragging(e.movementX);
});
categoriesList.addEventListener("mousedown", () => {
  isDragging = true;
});
categoriesList.addEventListener("mouseup", () => {
  isDragging = false;
});

arrowIcons.forEach((icon) => {
  icon.addEventListener("click", (e) => {
    categoriesList.classList.add("dragging");
    if (icon.id === "left") {
      dragging(200);
    } else {
      dragging(-200);
    }
  });
});

// clear image filters
const clearFilter = (element) => {
  for (let filter in searchFilter) {
    if (
      searchFilter[filter].split("=")[1]?.split("+").join(" ") ===
      element.textContent
    ) {
      searchFilter[filter] = "";
      showImage(getUrl(searchFilter.q, searchFilter.category));
    }
  }
};

// show image filter button
function showFilterButton() {
  filterList.innerHTML = "";
  Object.values(searchFilter).map((filter) => {
    let li = document.createElement("li");
    if (filter) {
      li.innerHTML = `<i class="fa fa-x"></i><span>${filter
        .split("=")[1]
        .split("+")
        .join(" ")}</span>`;
      li.onclick = (e) => {
        clearFilter(e.currentTarget);
      };
      filterList.append(li);
    }
  });
}

// update img on connection change
navigator.connection.onchange = () => {
  showImage(getUrl(searchFilter.q, searchFilter.category));
};
