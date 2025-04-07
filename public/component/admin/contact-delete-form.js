
class ContactDeleteForm extends AbstractComponent{
    constructor()
    {
        super(); 
    }
    static get observedAttributes() {return []; }
     
    connectedCallback() {
        this.#render();
    }
          
    setData(info)
    {
        this.info = {}
        this.info = info;
    }

    handleClick(e) {
        e.composedPath().find((node) => 
        {
            if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
            if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
            if(node.className.match(/command-delete-contact/))
            {
                this.#deleteContact();
                return;
            }      
        });
    }

    #render()
    {
        const template = this.#getTemplate();
        if(template) this.appendChild(template.content.cloneNode(true));
    }

    async #deleteContact()
    {
        try{
            const form = this.querySelector('form');
            const formData = new FormData(form);
            const response = await util.sendFormData(`/contact/delete`, "POST", formData);
            if(response.code === 100)
            {
                const message =  {msg:"DO_HIDE_MODAL", data:null} 
                window.postMessage(message, location.href);

                const message2 =  {msg:"COMMAND_CHANGE_DATA", data:response.data.info} 
                window.postMessage(message2, location.href);
            }
            else
            {
                console.log(response.message);
            }
        }
        catch (error) {
            console.error('오류:', error);
            alert('실패했습니다.');
        }
        return;
    }

    #getTemplate()
    {
        const tempalate = document.createElement('template');
        tempalate.innerHTML = `
        <style>
            .form-group{
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
        </style>
            <div class="card">
                <div class="card-header form-header row-space-between">
                    <span class="fw-semibold">문의사항 삭제</span>
                    <button type="button" class="btn btn-icon btn-black command-close-modal">
                    <i class="fas fa-times"></i></button>
                </div>
                <div class="card-body">
                    <form>
                        <input type="hidden" name="_id" value="${this.info._id}">
                        <div class="form-group">
                            <label for="name">이름</label>
                            <input type="text" id="name" readonly value="${this.info.name}" name="name" class="form-control" style="width: auto;">
                        </div>
                         <div class="form-group">
                            <label for="email">이메일</label>
                            <input type="text" id="email" readonly value="${this.info.email}" name="email" class="form-control" style="width: auto;">
                        </div>
                        <hr>
                        <button type="button" class="btn btn-danger form-control command-delete-contact">Delete 문의내욜</button>
                    </form>
                </div>    
            </div>
        `;  
        return tempalate;
    }

  }
  customElements.define('contact-delete-form', ContactDeleteForm);
  
  
  
  
  
   
  
  
  