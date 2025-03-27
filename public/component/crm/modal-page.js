class ModalPage extends AbstractComponent
{
    constructor()
    {
        super();  
        this.messageListener = this.onMessage.bind(this)
        window.addEventListener("message", this.messageListener);
        this.addEventListener('click', this.handleClick);
     }
    static get observedAttributes() {return ['component', 'z_index', 'id']; }
  
    handleClick(e) {
        e.composedPath().find((node) => 
        {
            if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
            if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
            if(node.className.match(/command-close-modal/))
            {
                this.#hideModal();
                return;
            }      
        });
    }
    onMessage(event){
        if(event.origin.indexOf(window.location.hostname) < 0) return;
        if(event.data?.msg === 'DO_SHOW_MODAL') 
        {
            this.#appendComponent(event.data.data)
            this.#showModal();
            return false;
        }
        if(event.data?.msg === 'DO_HIDE_MODAL') 
        {
            this.#hideModal();
            return false;
        }
    }
  
    connectedCallback() {
        this.#render();
    }
        
    disconnectedCallback(){
        window.removeEventListener("message", this.messageListener);
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if(name === 'component') this.component = newValue;
        if(name === 'z_index') this.z_index = newValue;
        if(name === 'id') this.modal_id = newValue;
    }
  
    #render()
    {
        const template = this.#getTemplate();
        this.appendChild(template.content.cloneNode(true));
        this.#setStyle();
    }

    #appendComponent(info)
    {
        this.querySelector('.modal-body').innerHTML = '';
        const _component = document.createElement(info.tagName);
        _component.setData(info.info);
        this.querySelector('.modal-body').appendChild(_component);
    }

    appendComponent(component)
    {
        this.querySelector('.modal-body').innerHTML = '';
        this.querySelector('.modal-body').appendChild(component);
        this.#showModal();
    }
    
    #setStyle()
    {
        const body = this.querySelector('.modal');
        if(this.z_index) body.style.zIndex = this.z_index;
        else body.style.zIndex = "1024";
        
        body.style.display = " block";
        body.style.width = " 100vw";
        body.style.height = "100vh";
        body.style.minWidth = "320px";
        body.style.margin = " 0px auto 0px auto";
        body.style.backgroundColor = "#dfe5efa1";
        body.style.position = " fixed";
        body.style.top = "0px";
        body.style.left = "-400px";
        body.style.transform = "translate3d(-100%, 0px, 0px)";
        body.style.transition = "all 1s";
    }

    #showModal()
    {
        const body = this.querySelector('.modal');
        body.style.transform = "translate3d(400px, 0px, 0px)";
        body.style.transition = "all 0.5s";
    }

    #hideModal()
    {
        const body = this.querySelector('.modal');
        this.querySelector('.modal-body').innerHTML = '';
        body.style.transform = "translate3d(-100%, 0px, 0px)";
        body.style.transition = "all 1s";
    }
    
    #getTemplate()
    {
        const inner_template = document.createElement('template');
        inner_template.innerHTML = `
        <style>
        
        </style>
        <div class="modal ">
            <div class="modal-body">
                
            </div>
        </div>
        `;
        return inner_template;
    }

  }
  customElements.define('modal-page', ModalPage);
  
  
  
  
  
   
  
  
  