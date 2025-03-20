class FileUpload extends HTMLElement{
    constructor(data)
    {
        super();   
        this.new = true;
        this.box = {};
        this.box.image = 0;
        this.box.etc = 0;
        this.box.file = [];
        this.BOXSIZE = 6;
        this.addEventListener('click', this.handleClick);
        this.data = {};
        Object.assign(this.data, data);
        this.editable = true;
     }
     
    static get observedAttributes() {return ['editable']; }
     
    post_message(message, data = null)
    {
        window.postMessage({msg:message, data:data}, location.origin);
    }  

    handleClick(e) {
        e.composedPath().find((node) => 
        {
                if (typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
                if(node.className.match(/command-delete-image-file/))
                {
                    this.swiper.removeSlide(this.swiper.clickedIndex);
                    this.#deleteInfo(node);
                    return;
                }
                if(node.className.match(/command-delete-etc-file/))
                {
                    this.#deleteInfo(node);
                    node.closest('div.download-box').remove();
                }
        });
    }

    connectedCallback() {
        this._render();
    }
        
    disconnectedCallback(){
        // Swiper 인스턴스 정리
        if (this.swiper) {
            this.swiper.destroy();
            this.swiper = null;
        }
        // 이미지 캐시 정리
        this.box = {};
        // DOM 이벤트 리스너 정리
        const fileInput = this.querySelector('input[type=file]');
        if (fileInput) {
            fileInput.removeEventListener('change', this._load_image);
        }
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        this[name] = JSON.parse(newValue)
    }
  
    _render()
    {
        const template = this.#getTemplate();
        if(template) this.appendChild(template.content.cloneNode(true));

        if(!this.#isAuthorized() || !this.editable) this.querySelector('input[type=file]').classList.add('hidden');
        this.querySelector('input[type=file]').addEventListener('change', e => this._load_image(e));

        this.slidesPerView = 2;
        if(document.body.clientWidth < 600) this.slidesPerView = 1;

        this.swiper = new Swiper('.swiper-container', {
            slidesPerView: 2,
            spaceBetween: 10,
            centeredSlidesBounds : true,
            breakpoints: {
                // when window width is >= 320px
                320: {
                  slidesPerView: 1,
                  spaceBetween: 10
                },
                // when window width is >= 480px
                480: {
                  slidesPerView: 1,
                  spaceBetween: 10
                },
                // when window width is >= 640px
                640: {
                  slidesPerView: 2,
                  spaceBetween: 10
                }
              }
          });
          
        
        this.#getData();
    }

    async _load_image(e) {
        if (this.#isOverSize()) {
            alert('최대 업로드 가능한 이미지 수를 초과했습니다.');
            return;
        }

        try {
            const id = util.secureRandom();
            await this.#addInfo(id);
        } catch (error) {
            console.error('이미지 업로드 중 오류:', error);
            alert('이미지 업로드에 실패했습니다.');
        }
    }

    

    #handleSuccessfulUpload(data, id) {
        if(this.#isImageFile(data))
        {
            this.#setSwiperImage(data, id);
            this.#addAttachFileButton(data, id);
            this.box.image++;
        }
        else
        {
            this.#addAttachEtcFileButton(data, id);
            this.box.etc++;
        }
        this.#resetFileInput();
        this.#updateFileCounter(data.name);
        
    }

    #setSwiperImage(data, id) {
        const preview_element = document.createElement('div');
        preview_element.classList.add('image-preview', 'swiper-slide');
        preview_element.setAttribute("id", id);
        preview_element.style.backgroundImage = `url(/uploads/${globalThis.user.clientId}/${data.name})`;
        
        this.swiper.appendSlide(preview_element);
    }

    #addAttachFileButton(info, id)
	{
        if(!this.#isAuthorized()  || !this.editable) return;
        const button = document.createElement("button")
		button.setAttribute('type', "button");
        button.classList.add("btn", "btn-icon")
		button.innerHTML = '<i class="fas fa-times"></i>';
		button.classList.add("command-delete-image-file");
		button.dataset.name = info.name;
		button.dataset.folder = info.folder;
        button.dataset.id = id;
		document.getElementById(id).appendChild(button);
	}	

    #isImageFile(data)
    {
        if(['image/jpeg', 'image/png', 'image/gif'].includes(data.mimetype)) return true;
        else return false;
    }
    
    async #getData() {
        try {
            const formData = new FormData();
            formData.append('contentsId', this.data._id);
            const response = await util.sendFormData("/upload/list", "POST", formData);
            if (response.code === 100) {
                response.data.list.map(async (item) => {
                    const id = util.secureRandom();
                    if(this.#isImageFile(item))
                    {
                        this.#setSwiperImage(item, id);
                        this.#addAttachFileButton(item, id);
                        this.box.file.push(item.name);
                        this.box.image++;
                    }
                    else
                    {
                        this.#addAttachEtcFileButton(item, id);
                        this.box.file.push(item.name);
                        this.box.etc++;
                    }
                    
                });
                
                this.#boxSetStatus();
            } else {
                this.#handleError(response);
            }
        } catch (error) {
            console.error('이미지 삭제 중 오류:', error);
            alert('이미지 삭제에 실패했습니다.');
        }
    }

    async #addInfo(id) {
        const form = this.querySelector('form');
        const formData = new FormData(form);
        formData.append('contentsId', this.data._id);
        
        try {
            const response = await util.sendFormFileData("/upload/add", "POST", formData);
            
            if (response.code === 100) {
                this.#handleSuccessfulUpload(response.data, id);
                this.#boxSetStatus();

            } else {
                this.#handleError(response);
            }
        } catch (error) {
            throw new Error('이미지 업로드 실패');
        }
    }

    async #deleteInfo(node) {
        try {
            const formData = new FormData();
            formData.append('name', node.dataset.name);
            formData.append('contentsId', this.data._id);

            const response = await util.sendFormData("/upload/delete", "POST", formData);
            if (response.code === 100) {
                
                this.#removeFromBox(response.data);
                this.#boxSetStatus();
            } else {
                this.#handleError(response);
            }
        } catch (error) {
            console.error('이미지 삭제 중 오류:', error);
            alert('이미지 삭제에 실패했습니다.');
        }
    }

    #isOverSize()
    {
        if((this.box.file.length) >= this.BOXSIZE) return true;
        else return false;
    }

    #boxSetStatus()
    {
        if(this.box.image === 0)
        {
            this.querySelector('.swiper-container').style.height = '0px';
        }
        else
        {
            this.querySelector('.swiper-container').style.height = '280px';
        }

        if(this.#isOverSize())
        {
            this.querySelector('input[type=file]').disabled = true;
        }
        else
        {
            this.querySelector('input[type=file]').disabled = false;
        }

        this.querySelector('label').innerHTML = `첨부 파일 (${this.box.file.length})`;

    }

    #handleError(response) {
        if (response.message) {
            alert(response.message);
        } else {
            console.error('오류 발생:', response);
        }
    }
    
    #resetFileInput() {
        const fileInput = this.querySelector('input[type=file]');
        if (fileInput) {
            fileInput.value = '';
        }
    }
    
    #updateFileCounter(imageName) {
        if (!this.box.file.includes(imageName)) {
            this.box.file.push(imageName);
            this.#boxSetStatus();
        }
    }
    
    #removeFromBox(data) {
        this.box.file = this.box.file.filter(item => item !== data.name);
        if(this.#isImageFile(data))this.box.image--;
        else this.box.etc--;
    }

    #addAttachEtcFileButton(info)
	{
		const button = document.createElement("button")
		button.setAttribute('type', "button");
        button.classList.add("btn", "btn-icon", "btn-xs");
		button.innerHTML = '<i class="fas fa-times"></i>';
		button.classList.add("command-delete-etc-file");
		button.dataset.name = info.name;

		const box = this.#makeDownLoadBox(info);
        if(this.#isAuthorized())  box.appendChild(button);
		this.querySelector('.etc-files').appendChild(box)
	}	

	#makeDownLoadBox(info)
	{
		const box = document.createElement('div');
		box.classList.add('download-box');
		box.innerHTML = `<a href="/uploads/${globalThis.user.clientId}/${info.name}" target="_blank">${info.name}</a>`;
		return box;
    }
    
    #isAuthorized()
    {
        if(globalThis.user.degree === '관리자' || this.data.isNew) return true;
        if(this.data.userId === globalThis.user._id) return true;
        return false;
    }

    #getTemplate()
    {
        const tempalate = document.createElement('template');
        tempalate.innerHTML = `
        <style>
            .image-preview{
            min-width: 230px;
            min-height: 230px;
            max-width:230px;
            background-repeat: no-repeat;
            background-size: contain;
            text-align: right;
            padding: 4px;
            }

            .swiper-container {
                width: 100%;
                height: 0px;
                overflow: hidden;
            }
            .hidden{display:none;}
            .command-delete-image-file {border: none; background: white;padding:2px;}
            input[type=file]{padding-bottom:6px;}
            .etc-files
            {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            .download-box{
                display: flex;
                gap: 12px;
                align-items: center;
                padding: 6px 12px;
                border: 1px solid #eee;
                border-radius: 15px;
                background: #f7f7f7;
                width: fit-content;
            }
            .command-delete-etc-file{color:#9c9c9c;}
        </style>

            <label for="boardFile" class="form-label ">첨부 이미지 </label>
            <div>
                <form  method="POST" enctype="multipart/form-data">
                    <input type="file" name="boardFile" id="boardFile">
                </form>
            </div>

            <div class="swiper-container">
                <div class="swiper-wrapper">
                    <!-- Slides -->
                </div>
            </div>    
            <div class="etc-files"></div>
        `;  
        return tempalate;
    }
}
customElements.define('file-upload', FileUpload);
  
  
  
  
  
   
  
  
  