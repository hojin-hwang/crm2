class FileImage extends HTMLElement{
    constructor()
    {
        super();   
        this.new = true;
        this.box = [];
        this.BOXSIZE = 3;
        this.addEventListener('click', this.handleClick);

        
     }
    static get observedAttributes() {return ['editable','contentsid', 'new']; }
     
    post_message(message, data = null)
    {
        window.postMessage({msg:message, data:data}, location.origin);
    }  

    handleClick(e) {
        const deleteButton = e.target.closest('.command-delete-file');
        if (!deleteButton) return;
        
        this.swiper.removeSlide(this.swiper.clickedIndex);
        this.#deleteInfo(deleteButton);
    }

    connectedCallback() {
        this._render();
    }
        
    disconnectedCallback(){
        window.removeEventListener("message", this.receiveMessage);
        // Swiper 인스턴스 정리
        if (this.swiper) {
            this.swiper.destroy();
            this.swiper = null;
        }
        // 이미지 캐시 정리
        this.box = [];
        // DOM 이벤트 리스너 정리
        const fileInput = this.querySelector('input[type=file]');
        if (fileInput) {
            fileInput.removeEventListener('change', this._load_image);
        }
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if(name == 'editable') 
        {
            this["editable"] = JSON.parse(newValue);
            if(!this["editable"] && this.querySelector('input[type=file]'))
            {
               this.querySelector('input[type=file]').style.display = 'none'
            }
        }
        if(name == 'contentsid') this.contentsId = newValue;
        if(name == 'new') this.new = JSON.parse(newValue);
    }
  
    _render()
    {
        
        const template = this.#getTemplate();
        if(template) this.appendChild(template.content.cloneNode(true));

        if(this.editable) this.querySelector('input[type=file]').addEventListener('change', e => this._load_image(e));
        else this.querySelector('input[type=file]').classList.add('hidden');

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

    async #addInfo(id) {
        const form = this.querySelector('form');
        const formData = new FormData(form);
        
        try {
            const response = await util.sendFormFileData("/upload/add", "POST", formData);
            
            if (response.code === 100) {
                this.#handleSuccessfulUpload(response.data, id);
            } else {
                this.#handleError(response);
            }
        } catch (error) {
            throw new Error('이미지 업로드 실패');
        }
    }

    #handleSuccessfulUpload(data, id) {
        this.#setSwiperImage(data, id);
        this.#addAttachFileButton(data, id);
        this.#resetFileInput();
        this.#updateImageCounter(data.name);
    }

    #setSwiperImage(data, id) {
        const preview_element = document.createElement('div');
        preview_element.classList.add('image-preview', 'swiper-slide');
        preview_element.setAttribute("id", id);
        preview_element.style.backgroundImage = `url(/uploads/${data.name})`;
        
        this.swiper.appendSlide(preview_element);
    }

    async #getData() {
        if (this.new) return;
        this.#performanceMonitor.start()
        try {
            const formData = new FormData();
            formData.append('contentsId', this.contentsId);
            const response = await util.sendFormData('/upload/getList', 'POST', formData);
            
            if (response.code === 100) {
                await Promise.all(response.list.map(async (data) => {
                    this.#setSwiperImage(data, data.id);
                    this.#addAttachFileButton(data, data.id);
                    this.box.push(data.id);
                }));
                
                this.#boxSetStatus();
            } else {
                this.#handleError(response);
            }
            this.#performanceMonitor.end('이미지 데이터 로딩');
        } catch (error) {
            console.error('데이터 로딩 중 오류:', error);
            alert('이미지 목록을 불러오는데 실패했습니다.');
        }
    }

    #addAttachFileButton(info, id)
	{
		if(!this.editable) return;
        const button = document.createElement("button")
		button.setAttribute('type', "button");
		button.innerHTML = '<i class="ti ti-x fs-4"></i>';
		button.classList.add("command-delete-file");
		button.dataset.name = info.name;
		button.dataset.folder = info.folder;
        button.dataset.id = id;
		document.getElementById(id).appendChild(button);
	}	

    async #deleteInfo(node) {
        try {
            const formData = new FormData();
            formData.append('name', node.dataset.name);
            
            const response = await util.sendFormData("/upload/delete", "POST", formData);
            if (response.code === 100) {
                this.#removeImageFromBox(node.dataset.name);
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
        if(this.box.length >= this.BOXSIZE) return true;
        else return false;
    }

    #boxSetStatus()
    {
        if(this.box.length === 0)
        {
            this.querySelector('.swiper-container').style.height = '0px';
            if(!this.editable) this.querySelector('label').classList.add('hidden')
            this.querySelector('label').innerHTML = `첨부 이미지`;
        }
        else
        {
            this.querySelector('.swiper-container').style.height = '280px';
            this.querySelector('label').innerHTML = `첨부 이미지 (${this.box.length})`;
        }

        if(this.box.length >= this.BOXSIZE)
        {
            this.querySelector('input[type=file]').disabled = true;
        }
        else
        {
            this.querySelector('input[type=file]').disabled = false;
        }
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
    
    #updateImageCounter(imageName) {
        if (!this.box.includes(imageName)) {
            this.box.push(imageName);
            this.#boxSetStatus();
        }
    }
    
    #removeImageFromBox(imageName) {
        this.box = this.box.filter(item => item !== imageName);
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
            .command-delete-file {border: none; background: white;padding:2px;}
            input[type=file]{padding-bottom:6px;}
        </style>

            <label for="myFile" class="form-label ">첨부 이미지 </label>
            <div>
                <form  method="POST" enctype="multipart/form-data">
                    <input type="file" name="myFile" accept="image/*">
                </form>
            </div>

            <div class="swiper-container">
                <div class="swiper-wrapper">
                    <!-- Slides -->
                </div>
            </div>    

            
        `;  
        return tempalate;
    }

    #performanceMonitor = {
        startTime: null,
        
        start() {
            this.startTime = performance.now();
        },
        
        end(operation) {
            const duration = performance.now() - this.startTime;
            console.debug(`${operation} 수행 시간: ${duration.toFixed(2)}ms`);
        }
    };
}
customElements.define('file-image', FileImage);
  
  
  
  
  
   
  
  
  