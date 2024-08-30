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

        let textarea = document.createElement('textarea');
        textarea.classList.add('form-control', 'mt-2');

        let imageListString = this.data.imageList ? this.data.imageList : '';
        textarea.value = imageListString;

        let imageList = imageListString.split("\n").map(item => item.trim().replace(/,$/, '')).filter(item => item.length > 0);

        let galleryWrapper = document.createElement('div');
        galleryWrapper.classList.add('editorjs-gallery-grid');

        imageList.forEach((item) => {
            let imgWrapper = document.createElement('div');
            let img = document.createElement('img');
            img.src = "../uploads/thumbnails/" + item;
            imgWrapper.appendChild(img);
            galleryWrapper.appendChild(imgWrapper);
        })

        var sortable = new Sortable(galleryWrapper, {
            animation: 150,
            ghostClass: "sortable-ghost", 
            chosenClass: "sortable-chosen",
            dragClass: "sortable-drag",
        });

        let btn = document.createElement('button');
        btn.classList.add('btn', 'btn-primary', 'my-2');
        btn.setAttribute('data-bs-toggle', 'modal');
        btn.setAttribute('data-bs-target', '#image-library-modal-fullscreen');
        btn.innerHTML = 'Select Images';

        btn.addEventListener('click', function(event) {
            event.preventDefault();

            setSelectedImages(imageList);
            setResultElem(textarea);
            setGalleryElem(galleryWrapper);

            setSelectedImageButton.innerHTML = 'Insert Images';
            openImageLibraryModal('insert-gallery-images');

        });

        let wrapper = document.createElement('div');
        wrapper.appendChild(galleryWrapper);
        wrapper.appendChild(textarea);
        wrapper.appendChild(btn);
        
        return wrapper;
    }

    save(blockContent) {
        const imageList = blockContent.querySelector('textarea').value;

        let imgList = '';
        let imgListArray = [];

        const galleryImageElems = blockContent.querySelectorAll('.editorjs-gallery-grid img');

        if(galleryImageElems) {
            galleryImageElems.forEach((imageElem) => {
                let imgSrc = imageElem.getAttribute('src');
                imgSrc = imgSrc.replace("../uploads/thumbnails/", "");
                imgListArray.push(imgSrc);
            })
            imgList = imgListArray.join(",\n");
            console.log(imgList);
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


export { InsertImage, editor };