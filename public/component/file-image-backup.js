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
        e.composedPath().find((node) => 
        {
            if (typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
            if(node.className.match(/command-delete-file/))
            {
                const formData = new FormData()
                formData.append("folder", node.dataset.folder)
                formData.append("name", node.dataset.name)
                formData.append("id", node.dataset.id)

                //node.closest('div.image-preview').remove();
                this.swiper.removeSlide(this.swiper.clickedIndex)
                this.#deleteInfo(formData);
            }
        });
    }

    connectedCallback() {
        this._render();
    }
        
    disconnectedCallback(){
        window.removeEventListener("message", this.receiveMessage);
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

    _load_image = e => {
        if(this.#isOverSize()) return;

		const files = e.target.files;
		const filesArr = Array.prototype.slice.call(files);
        const previewId = util.secureRandom();
		// 여러장의 이미지를 불러올 경우, 배열화
		filesArr.forEach(file => {
			const reader = new FileReader();
			reader.onload = e => {
				const image = new Image();
				image.className = "img-item"; // 스타일 적용을 위해
				image.src = e.target.result;
				image.onload = imageEvent => {
				  this.image_data = {};
				  this.image_data.data_url = this.#resize_image(image);
                  this.image_data.resizedImage = this.#dataURLToBlob(this.image_data.data_url);
                  this.image_data.id = previewId;
                  this.#setSwiperImage(null, true);
	
				};
				image.onerror = function() {
					console.log("error");
				};
			};
			reader.readAsDataURL(file);

            setTimeout(() => {
                const formData = new FormData();
                const imageInfo = (this.#getImage());
                if(imageInfo.data_url && imageInfo.resizedImage)
                {
                    formData.append('board_image[]', imageInfo.resizedImage)
                }
                this.#addInfo(formData, previewId);
            }, 100);

		});
	};

    #getImage()
    {
        return this.image_data;
    }

    #resize_image(image)
    {
        let canvas = document.createElement("canvas"),
            max_size = 1280, // 최대 기준을 1280으로 잡음.
            width = image.width,
            height = image.height;
    
        if (width > height) 
        {
            if (width > max_size) // 가로가 길 경우
            {
                height = height / ( width / max_size)
                width = max_size;
            }
        } 
        else 
        {
            if (height > max_size) // 세로가 길 경우
            {
                width = width / (height / max_size);
                height = max_size;
            }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(image, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        // 미리보기 위해서 마크업 추가.
        return dataUrl;
    };

    #dataURLToBlob(dataURL)
    {
        var BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) == -1) {
            var parts = dataURL.split(',');
            var contentType = parts[0].split(':')[1];
            var raw = parts[1];

            return new Blob([raw], {type: contentType});
        }

        var parts = dataURL.split(BASE64_MARKER);
        var contentType = parts[0].split(':')[1];
        var raw = window.atob(parts[1]);
        var rawLength = raw.length;

        var uInt8Array = new Uint8Array(rawLength);

        for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], {type: contentType});
    }

    #setSwiperImage(data, file = false)
    {
        const preview_element = document.createElement('div');
        preview_element.classList.add('image-preview','swiper-slide');
        preview_element.setAttribute("id", (file)? this.image_data.id : data.id);
        preview_element.style.backgroundImage = (file)? `url(${this.image_data.data_url})`:`url(/skin/ko/crm/files/images/${data.name})`;
        this.swiper.appendSlide(preview_element);
    }

    #getData()
    {
        if(this.new) return;
        else
        {
            const formData = new FormData();
            formData.append('contentsId', this.contentsId);
            formData.append('folder', 'images');
            util.get_json_request("POST", '/api/crm/boardFile/getList', formData, (response)=>
            {
                if (100 == response.code)
                {
                    response.list.forEach(data=>{
                        this.#setSwiperImage(data);
                        this.#addAttachFileButton(data, data.id);
                        this.box.push(data.id);
                    });
                    
                    this.#boxSetStatus();
       
                    return;
                }
                else
                {
                    if (response.message) alert(response.message, true);
                    else console.dir(response); 
                }       
            });

            return;
        }
    }

    #addInfo(formData, previewId)
	{
		const info = {};

		for (const pair of formData.entries()) {
			info[pair[0]] = pair[1];
		}
		info['date'] = util.getDayDashFormat(new Date())

		if(!info["id"])
		{
			info["id"] = util.secureRandom(); 
			formData.append('id', info["id"] );
		} 
		
        formData.append('contentsId', this.contentsId);

		util.get_json_request("POST", '/api/crm/boardFile/add', formData, (response)=>
		{
            if (100 == response.code)
            {
                this.#addAttachFileButton(response.info, previewId);
                this.querySelector('input[type=file]').value="";
                this.box.push(info.id);
                this.#boxSetStatus();
                return;
            }
            else
            {
                if (response.message) alert(response.message, true);
                else console.dir(response); 
            }       
		});

		return;
	}

    #addAttachFileButton(info, previewId)
	{
		if(!this.editable) return;
        const button = document.createElement("button")
		button.setAttribute('type', "button");
		button.innerHTML = '<i class="ti ti-x fs-4"></i>';
		button.classList.add("command-delete-file");
		button.dataset.name = info.name;
		button.dataset.folder = info.folder;
        button.dataset.id = info.id;
		document.getElementById(previewId).appendChild(button);

	}	

    

    #deleteInfo(formData)
	{
		util.get_json_request("POST", '/api/crm/boardFile/delete', formData, (response)=>
		{
            if (100 == response.code)
            {
                this.#removeBoxElement(formData.get("id"));
                this.#boxSetStatus();
                return;
            }
            else
            {
                if (response.message) alert(response.message, true);
                else console.dir(response); 
            }       
		});
		return;
	}

    #isOverSize()
    {
        if(this.box.length >= this.BOXSIZE) return true;
        else return false;
    }

    #removeBoxElement(id)
    {
        this.box = this.box.filter(item => item.toString() !== id);
    }

    #boxSetStatus()
    {
        
        if(this.box.length === 0)
        {
            this.querySelector('.swiper-container').style.height = '0px';
            if(!this.editable) this.querySelector('label').classList.add('hidden')
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

            <label for="board_image[]" class="form-label ">첨부 이미지 </label>
            <div>
                <input type="file" name="board_image[]" accept="image/*">
            </div>

            <div class="swiper-container">
                <div class="swiper-wrapper">
                    <!-- Slides -->
                </div>
            </div>    
        `;  
        return tempalate;
    }

  }
  customElements.define('file-image', FileImage);
  
  
  
  
  
   
  
  
  