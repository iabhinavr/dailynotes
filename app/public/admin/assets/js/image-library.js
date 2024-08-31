// Handle image library modal

import {
    setSelectedImageButton,
    sidebarImageButton,
    getResultElem,
    getSelectedImages,
    setSelectedImages,
    getGalleryElem,
    imageLibrary, 
    imagesUl, 
    prevElem, 
    nextElem 
} from "./elements";

import { createGalleryGrid } from "./editor";

const openImageLibraryModal = async function (action) {

    imagesUl.innerHTML = '';

    setSelectedImageButton.setAttribute('data-action', action);

    const fetchArgs = new FormData();
    fetchArgs.append('fetch-images', "submitted");
    fetchArgs.append('per_page', 50);
    fetchArgs.append('page_no', 1);

    const fetchImages = await fetch('/admin/image-library.php', {
        method: 'POST',
        body: fetchArgs,
    });

    const fetchJson = await fetchImages.json();

    if(fetchJson.status === true) {
        let images = fetchJson.result;

        await insertImages(images);
        calculatePagination(50,1);
        
    }
}

const imageOnClick = async function (event) {

    event.currentTarget.classList.toggle('selected');
    let siblings = event.currentTarget.parentNode.childNodes;

    siblings.forEach((sibling) => {
        if(!(sibling === event.currentTarget)) {
            sibling.classList.remove('selected');
        }
    });

    if(event.currentTarget.classList.contains('selected')) {
        const imageId = event.currentTarget.getAttribute('data-image-id');
        const imagePath = event.currentTarget.getAttribute('data-image-path');

        setSelectedImageButton.setAttribute('data-image-id', imageId);
        setSelectedImageButton.setAttribute('data-thumbnail-src', '../uploads/thumbnails/' + imagePath);
        setSelectedImageButton.setAttribute('data-full-src', '../uploads/large/' + imagePath);
    }
    else {
        setSelectedImageButton.setAttribute('data-image-id', '');
        setSelectedImageButton.setAttribute('data-thumbnail-src', '');
        setSelectedImageButton.setAttribute('data-full-src', '');
    }

    
}

const multiImageSelector = async function (event) {
    
    /**
     * retrieve the selectedImages, which was set 
     * when the block's button was clicked
     * 
     * then here, modify the array when the items are
     * selected or un-selected
     */

    let selectedImages = await getSelectedImages();
    let newSelectedImages = [];

    event.currentTarget.classList.toggle('selected');

    let imagePath = event.currentTarget.getAttribute('data-image-path');

    if(event.currentTarget.classList.contains('selected')) {        
        selectedImages.unshift(imagePath);
    }
    else {
        newSelectedImages = selectedImages.filter(e => e != imagePath);
        selectedImages = newSelectedImages;
    }
    setSelectedImages(selectedImages);

    /**
     * selectedImages is modified, now the rest happens 
     * when the Insert Images button is clicked (setSelectedImageButtonOnClick)
     */
}

const setImageSelectEvent = async function(item) {
    let action = setSelectedImageButton.getAttribute('data-action');
    
    switch(action) {
        case 'insert-gallery-images':
            item.removeEventListener('click', multiImageSelector);
            item.addEventListener('click', multiImageSelector);
            break;
        default:
            item.removeEventListener('click', imageOnClick);
            item.addEventListener('click', imageOnClick);
    }
    
}

const insertImages = async function (images) {

    let imageList = await getSelectedImages();

    images.map((image) => {
        let item = document.createElement('li');
        let itemLink = document.createElement('a');
        let itemImg = document.createElement('img');

        let imagePath = image.folder_path + '/' + image.file_name;

        item.setAttribute('data-image-id', image.id);
        item.setAttribute('data-image-path', image.folder_path + '/' + image.file_name);
        item.setAttribute('class', 'item col');

        if(imageList.includes(imagePath)) {
            item.classList.add('selected');
        }

        itemLink.setAttribute('href', '#');
        itemLink.setAttribute('class', 'd-block position-relative w-100')

        itemImg.setAttribute('src', '../uploads/thumbnails/' + image.folder_path + '/' + image.file_name);
        itemImg.setAttribute('alt', image.title);
        itemImg.setAttribute('class', 'w-100 h-100 object-fit-cover object-center')
        
        itemLink.appendChild(itemImg);
        item.appendChild(itemLink);

        setImageSelectEvent(item);

        imagesUl.appendChild(item);
    });
}

const calculatePagination = async function (per_page, page_no) {

    per_page = parseInt(per_page);
    page_no = parseInt(page_no);

    const args = new FormData();

    args.append('get_image_count', 'submitted');
    args.append('per_page', per_page);
    args.append('page_no', page_no);

    const getTotal = await fetch('/admin/image-library.php', {
        method: 'POST',
        body: args,
    });

    const resJson = await getTotal.json();
    let count = resJson.image_count;

    let totalPages = 
    (count % per_page) === 0 ? 
    Math.floor(count / per_page) : 
    Math.floor(count / per_page) + 1;

    let prev = false;
    let next = false;

    if(page_no > 1) {
        prev = true;
    }

    if(page_no < totalPages) {
        next = true;
    }    

    if(prev) {
        prevElem.classList.remove('disabled');
        prevElem.setAttribute('data-page-no', page_no - 1);
    }
    else {
        prevElem.classList.add('disabled');
        prevElem.setAttribute('data-page-no', '');
    }

    if(next) {
        nextElem.classList.remove('disabled');
        nextElem.setAttribute('data-page-no', page_no + 1);
    }
    else {
        nextElem.classList.add('disabled');
        nextElem.setAttribute('data-page-no', '');
    }

}

const paginate = async function (event) {
    let page_no = event.currentTarget.getAttribute('data-page-no');

    imagesUl.innerHTML = '';

    const fetchArgs = new FormData();
    fetchArgs.append('fetch-images', "submitted");
    fetchArgs.append('per_page', 50);
    fetchArgs.append('page_no', page_no);

    const fetchImages = await fetch('/admin/image-library.php', {
        method: 'POST',
        body: fetchArgs,
    });

    const fetchJson = await fetchImages.json();

    if(fetchJson.status === true) {
        let images = fetchJson.result;

        await insertImages(images);
        calculatePagination(50,page_no);
        
    }
}

const setSelectedImageButtonOnClick = async function (event) {
    const buttonAction = event.currentTarget.getAttribute('data-action');
    const imageId = event.currentTarget.getAttribute('data-image-id');
    const thumbnailSrc = event.currentTarget.getAttribute('data-thumbnail-src');
    const fullSrc = event.currentTarget.getAttribute('data-full-src');

    const resultElem = await getResultElem();

    switch(buttonAction) {
        case 'set-featured-image' :
            if(thumbnailSrc && fullSrc) {
                resultElem.value = imageId;
                sidebarImageButton.style.backgroundImage = 'url(' + thumbnailSrc + ')';
            }
            break;
        case 'insert-post-image' :
            resultElem.src = fullSrc;
            break;
        case 'insert-gallery-images':
            /**
             * get the selectedImages and re-render the gallery
             * the gallery element was already stored in the state variable
             */
            let imageList = await getSelectedImages();
            let galleryWrapper = await getGalleryElem();

            /**
             * empty the gallery grid before re-rendering
             */

            let galleryGrid = galleryWrapper.querySelector('.editorjs-gallery-grid');
            
            if(galleryGrid) {
                galleryGrid.remove();
            }

            /**
             * now create the new gallery grid
             */

            galleryGrid = createGalleryGrid(imageList);

            galleryWrapper.prepend(galleryGrid);

            break;
        default:
            console.log('nothing happened');

    }

    imageLibrary.classList.remove('fixed');
    imageLibrary.classList.add('hidden');
}

const closeImageLibraryOnClick = async function (event) {

    imageLibrary.classList.remove('fixed');
    imageLibrary.classList.add('hidden');
}

export { 
    openImageLibraryModal,
    imageOnClick,
    paginate,
    setSelectedImageButtonOnClick,
    closeImageLibraryOnClick,
}