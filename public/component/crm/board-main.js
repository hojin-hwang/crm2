
class BoardMain extends AbstractComponent{
    constructor()
    {
        super();   
        this.contentsId = null;
     }
    static get observedAttributes() {return ['id', 'boardid', 'userid']; }
     
    connectedCallback() {
        this.#render();
    }
        
    disconnectedCallback(){
        window.removeEventListener("message", this.receiveMessage);
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if(name == 'boardid') this.boardId = newValue;
        if(name == 'id') this.contentsId = newValue;
        if(name == 'userid') this.userId = newValue;
    }
    
    setData()
    {

    }
    
    #render()
    {
        this.isNewContents = (this.contentsId)? false:true;
        this.editable = (this.isNewContents)? true : this.#getEditable();
        const template = this.#getTemplate();
        if(template) this.appendChild(template.content.cloneNode(true));
        this.#getData()
    }

    #getData()
    {
        if(this.contentsId)
        {
            const formData = new FormData();
            formData.append('_id', this.contentsId );
            util.sendFormData('/board/get', "POST", formData).then((response) => {
                if (100 == response.code)
                    {
                        this.data = {};
                        Object.assign(this.data, response.data.info)
                        this.data.isNew = false;
                        const boardContents = new BoardContents(this.data);
                        boardContents.setAttribute("id", this.contentsId);
                        this.appendChild(boardContents);
                        const fileImage = new FileUpload(this.data)
                        this.appendChild(fileImage);                        
                        return;
                    }
                    else
                    {
                        if(response.code == 401)
                        {
                            window.location.href = '/user/login';
                            return;
                        }
                        if (response.message) alert(response.message, true);
                        else console.dir(response); 
                    } 
            });
            return;
        }
        else {
            const defaultData = {isNew:true, boardId : this.boardId, _id:util.generateObjectId()}
            const boardContents = new BoardContents(defaultData);
            this.appendChild(boardContents);
            const fileImage = new FileImage(defaultData)
            this.appendChild(fileImage);
        }
    }

    #getEditable()
    {
        if(globalThis.user.userId === this.userId) return true;
        else return false;
    }

    #getTemplate()
    {
        const tempalate = document.createElement('template');
        tempalate.innerHTML = `
                <style>
                    contents-view{
                        gap: 10px;
                        display: flex;   
                        flex-direction: column;
                    }
                </style>
        `;  
        return tempalate;
    }

  }
  customElements.define('board-main', BoardMain);
  
  
  
  
  
   
  
  
  