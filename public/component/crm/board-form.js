
class BoardForm extends AbstractComponent{
    constructor(info)
    {
        super();   
        this.contentsId = "";
     }
    static get observedAttributes() {return []; }
     
    connectedCallback() {
        this.title = document.querySelector('.page-header').innerText;
        this.#render();
    }
        
    disconnectedCallback(){
        window.removeEventListener("message", this.receiveMessage);
    }
    
    setData(info)
    {
        if(info)
        {
            this.boardId = info?.boardId;
            this.contentsId = (info?._id)? info._id:"";
            this.userId = (info?.userId)? info.userId : globalThis.user._id;
        }
        else {
            this.userId =  globalThis.user._id;
            this.boardId = document.querySelector('table-list').info.boardId
        }
    }

    #render()
    {
        const template = this.#getTemplate();
        if(template) this.appendChild(template.content.cloneNode(true));
    }

    #getTemplate()
    {
        const tempalate = document.createElement('template');
        tempalate.innerHTML = `
            <div class="card">
                <div class="card-header form-header row-space-between">
                    <span class="fw-semibold">${this.title}</span>
                    <button type="button" class="btn btn-icon btn-black command-close-modal">
                    <i class="fas fa-times"></i></button>
                </div>
                <div class="card-body">
                    <board-main id="${this.contentsId}" boardid="${this.boardId}" userid="${this.userId}" ></board-main>
                    <board-reply contentsid="${this.contentsId}"></board-reply>
                </div>    
            </div>
        `;  
        return tempalate;
    }

  }
  customElements.define('board-form', BoardForm);
  
  
  
  
  
   
  
  
  