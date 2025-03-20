
class AlertMessage extends HTMLElement{
    constructor(message = "")
    {
        super();   
        this.message = message;
        this.#render();
     }
    static get observedAttributes() {return []; }
     

    #render()
    {
        const template = this.#getTemplate();
        if(template) this.appendChild(template.content.cloneNode(true));
        
        document.querySelector('body').appendChild(this)
        
        setTimeout(() => {
            this.remove();
        }, 1500);
    }


    #getTemplate()
    {
        const tempalate = document.createElement('template');
        tempalate.innerHTML = `
        <style>
           alert-message .alert{
                max-width: 90%;
                position: absolute;
                left: 50%;
                top:50%;
                transform: translate(-50%, -50%);
                transform: translate(-50%, 0%);
                z-index:1024;
            }
        </style>
                <div class="alert alert-primary" role="alert">
                    ${this.message}
                </div>
        `;  
        return tempalate;
    }

  }
  customElements.define('alert-message', AlertMessage);
  
  
  
  
  
   
  
  
  