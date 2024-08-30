import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import JSON5 from 'json5';
import ImageTool from '@editorjs/image';
import CodeTool from '@editorjs/code';

import Sortable from 'sortablejs';

import { openImageLibraryModal } from "./image-library";
import { editorElem, setResultElem, setSelectedImages, setGalleryElem, editArticleForm, setSelectedImageButton } from "./elements";

class InsertImage {
    static get toolbox() {
        return {
            title: 'Insert Image',
            icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>'
        }
    }

    constructor({data}) {
        this.data = data;
    }

    render() {
        let img = document.createElement('img');
        img.classList.add('w-100');

        let title = document.createElement('input');
        title.setAttribute('type', 'text');
        title.classList.add('form-control', 'mt-2');
        title.setAttribute('placeholder', 'Enter caption...');
        title.value = this.data.caption ? this.data.caption : '';

        let btn = document.createElement('button');
        btn.classList.add('btn', 'btn-primary', 'my-2');
        btn.setAttribute('data-bs-toggle', 'modal');
        btn.setAttribute('data-bs-target', '#image-library-modal-fullscreen');
        btn.innerHTML = 'Choose Image';

        img.src = (this.data.file && this.data.file.url) ? this.data.file.url : '/admin/assets/images/default-image.jpg';

        btn.addEventListener('click', function(event) {
            event.preventDefault();

            setResultElem(img)

            openImageLibraryModal('insert-post-image');

        });

        let wrapper = document.createElement('div');
        wrapper.appendChild(img);
        wrapper.appendChild(title);
        wrapper.appendChild(btn);

        
        return wrapper;
    }

    save(blockContent) {
        const src = blockContent.querySelector('img').src;
        const caption = blockContent.querySelector('input').value;
        return {
            
            file: {
                url: src
            },
            caption: caption,
            withBorder: false,
            withBackground: false,
            stretched: false,
            
        }
    }
}

const createGalleryGrid = function(imageList) {
    let galleryGrid = document.createElement('div');
    galleryGrid.classList.add('editorjs-gallery-grid');

    imageList.forEach((item) => {
        let imgWrapper = document.createElement('div');
        let img = document.createElement('img');
        img.src = "../uploads/thumbnails/" + item;
        imgWrapper.appendChild(img);
        galleryGrid.appendChild(imgWrapper);
    })

    var sortable = new Sortable(galleryGrid, {
        animation: 150,
        ghostClass: "sortable-ghost", 
        chosenClass: "sortable-chosen",
        dragClass: "sortable-drag",
    });

    return galleryGrid;
}

class InsertGallery {
    static get toolbox() {
        return {
            title: 'Insert Gallery',
            icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>'
        }
    }

    constructor({data}) {
        this.data = data;
    }

    render() {

        let imageList = this.data.imageList ? this.data.imageList : [];

        let galleryGrid = createGalleryGrid(imageList);

        let btn = document.createElement('button');
        btn.classList.add('btn', 'btn-primary', 'my-2');
        btn.setAttribute('data-bs-toggle', 'modal');
        btn.setAttribute('data-bs-target', '#image-library-modal-fullscreen');
        btn.innerHTML = 'Select Images';

        btn.addEventListener('click', function(event) {
            event.preventDefault();

            /**
             * when the button is clicked, we need to parse the gallery
             * to find the list of images, then store it to the state variable
             * selectedImages
             * 
             * this state variable can be used to highlight the selected images
             * in the image-library
             * 
             * once the image items are modified (added or removed) from
             * the image-gallery modal, the selectedImages 
             * is set to the new value
             * 
             * back in the editor, selectedImages is used to re-render
             * the gallery block
             * 
             * after all, the selectedImages is reset to empty array
             * 
             */

            // so, let's parse the galleryWrapper to find the images srcs

            let galleryWrapper = event.currentTarget.closest('.editorjs-gallery');

            let imgElems = galleryWrapper.querySelectorAll('img');
            let imgSrcs = [];

            if(imgElems) {
                imgElems.forEach((img) => {
                    let src = img.getAttribute('src');
                    src = src.replace('../uploads/thumbnails/', '');
                    imgSrcs.push(src);
                });
                console.log(imgSrcs);
            }

            setSelectedImages(imgSrcs);

            /**
             * now that the selectedImages is saved to state,
             * the rest is in image-library
             * 
             * before that, save the current galleryWrapper also
             * to a state variable
             */

            setGalleryElem(galleryWrapper);

            setSelectedImageButton.innerHTML = 'Insert Images';
            openImageLibraryModal('insert-gallery-images');

        });

        let galleryWrapper = document.createElement('div');
        galleryWrapper.classList.add('editorjs-gallery');
        galleryWrapper.appendChild(galleryGrid);
        galleryWrapper.appendChild(btn);
        
        return galleryWrapper;
    }

    save(blockContent) {

        let imageList = [];

        const galleryImageElems = blockContent.querySelectorAll('.editorjs-gallery-grid img');

        if(galleryImageElems) {
            galleryImageElems.forEach((imageElem) => {
                let imgSrc = imageElem.getAttribute('src');
                imgSrc = imgSrc.replace("../uploads/thumbnails/", "");
                imageList.push(imgSrc);
            })
        }       

        return {
            
            imageList: imageList
            
        }
    }
}

let editor = null;

(async function(){

    const getEditorData = async function (editorElem) {

        const articleId = editArticleForm.querySelector('input[name="article-id"]').value;

        let articleData = new FormData();
        articleData.append("id", articleId);
        articleData.append("get-article-content", "submitted");

        const result = await fetch('/admin/edit-article.php', {
            method: 'POST',
            body: articleData
        });


        const articleContent = await result.text();

        let editorContent = editorElem.innerHTML;
        editorElem.innerHTML = '';
    
        let decodedEditorContent = '';
        let parsedEditorContent = {};
    
        try {
            decodedEditorContent = window.atob(editorContent);
            parsedEditorContent = JSON5.parse(articleContent);
        }
        catch(e) {
            return {};
        }
    
        return parsedEditorContent;
    
    }

    const getEditor = async function(editorElem) {
        let editorContent = await getEditorData(editorElem);
    
        if(editorElem === null || editorElem === undefined) {
            return false;
        }
    
        const editor = new EditorJS({
            holder: 'editorjs',
        
            tools: {
                header: {
                    class: Header,
                    inlineToolbar: ['link']
                },
                list: {
                    class: List,
                    inlineToolbar: true
                },
                image: {
                    class: ImageTool,
                    config: {
                        endpoints: {
                            byFile: '/admin/image-library.php',
                        },
                        field: 'editor-image',
                    }
                },
                insertImage: {
                    class: InsertImage
                },
                insertGallery: {
                    class: InsertGallery
                },
                code: CodeTool,
            },
    
            data: editorContent,
            autofocus: true,
        });
    
        return editor;
    }
    
    if(editorElem) {
        editor = await getEditor(editorElem);
    }
    
})();


export { InsertImage, createGalleryGrid, InsertGallery, editor };