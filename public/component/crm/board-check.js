
class BoardCheck extends HTMLElement{
    constructor()
    {
        super();   
        this.data = {};
        this.BOXSIZE = 40;
        this.addEventListener('click', this.handleClick);
     }
    static get observedAttributes() {return ['contentsid']; }
     
    handleClick(e) {
        e.composedPath().find((node) => 
        {
            if (typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
            if(node.className.match(/command-check-this-contents/))
            {
                this.#updateInfo();
                return;
                
            }
            if(node.className.match(/command-show-user-list/))
            {
                if(this.data.read.length > 0) this.querySelector('.check-user-list').style.display = 'flex';
                return;
            }
            if(node.className.match(/command-hide-user-list/))
            {
                this.querySelector('.check-user-list').style.display = 'none';
                return;
            }
        });
    }

    connectedCallback() {
        this._render();
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if(name == 'contentsid') this.contentsId = newValue;
    }

    _render()
    {
        const template = this.#getTemplate();
        if(template) this.appendChild(template.content.cloneNode(true));
        
    }

    setData(data)
    {
        if(!data) return;
        Object.assign(this.data, data)
        if(this.#checkedUser()) this.#disabledButton();
        this.#readCount();
        this.#getUserList();
    }

    #readCount(){
        this.querySelector('.check-count').innerText = this.data.read.length;
    }

    #checkedUser()
    {
        return this.data.read.includes(globalThis.user._id);
    }

    #disabledButton()
    {
        this.querySelector('.command-check-this-contents').disabled = true;
    }

    #getUserList()
    {
        this.data.read.forEach(id => {
            if(!id) return;
            const user_info = store.getInfo('user', '_id', id);
            if(user_info) this.#appendUserName(user_info.name)
        });
    }

    #appendUserName(name)
    {
        const listBox = this.querySelector('.check-user-list-body')
        const span = document.createElement('span');
        span.innerText = name;
        listBox.appendChild(span)
    }

    #updateInfo()
	{
		const formData = new FormData();
        formData.append('_id', this.data._id);
        formData.append('boardId', this.data.boardId);
        formData.append('read', globalThis.user._id);
		util.sendFormData('/board/update/read', "POST", formData).then((response) => 
		{
				if (100 == response.code)
				{
                    this.data.read.push(globalThis.user._id);
                    this.#disabledButton();
                    this.#readCount();
                    this.#appendUserName(globalThis.user.name)
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

    #getTemplate()
    {
        const tempalate = document.createElement('template');
        tempalate.innerHTML = `
        <style>
            .check-button-group{
                justify-content: end;
                padding-top: 12px;
            }
            .check-user-list
            {
                position: absolute;
                left: 20px;
                width: 90%!important;
                border: 1px solid;
                padding: 12px;
                border-radius: 15px;
                display: none;
                flex-direction: row;
                gap: 0px;
                background-color: white;
                z-index: 1024;
                align-item : top;
                justify-content: space-between;
            }
            .check-user-list-body
            {
                display:flex;
                flex-wrap: wrap;
                gap:3px;
                width: 100%;
            }
            .check-user-list-head{
                text-align : right;
            }
            .check-count{
                border: none;
                min-width: 30px;
                max-height: 30px;
            }
            .check-button-group{
                display: flex;
                gap: 8px;
                min-width: 79px;
            }
            .command-hide-user-list{
                border: none;
                background: white;
            }
            .command-check-this-contents{
                padding:4px 8px
            }
        </style>
            <div class="check-button-group">
                <button type="button" class="check-count command-show-user-list">0</span>
                <button type="button" class="btn btn-xs btn-icon btn-round btn-danger command-check-this-contents" contentsid="${this["contentsId"]}">
                    <i class="fa fa-heart" style=" font-size: 12px;"></i>
                </button>
            </div>
            <div class="check-user-list">
                <div class="check-user-list-body">
                </div>
                <button type="button" class="btn btn-icon command-hide-user-list">
                    <i class="fas fa-times"></i>
                </button>
            <div>
        `;  
        return tempalate;
    }

  }
  customElements.define('board-check', BoardCheck);
  
  
  
  
  
   
  
  
  