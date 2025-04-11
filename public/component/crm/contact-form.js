class ContactForm extends AbstractComponent
{
    constructor()
    {
        super();  
        this.addEventListener('click', this.handleClick);
        this.data ={};
        this.setData();
        
    }

    handleClick(e) {
        e.composedPath().find((node)=>{
        if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
        if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
        if(node.className.match(/command-save-form/))
        {
            const form = this.querySelector('form');
            if(this.#saveCondition(form)) 
            {
                this.#applyForm();
                return;
            }
            return;
        }
        if(node.className.match(/command-save-form/))
        {
            this.remove();
            return;
        }
        });
    }

    render()
    {
        const template = this.#getTemplate();
        this.appendChild(template.content.cloneNode(true));
    }
    
    setData()
    {
        if(globalThis.user)
        {
            Object.assign(this.data, globalThis.user);
            this.data["memo"] = "";
            this.data["email"] = (this.data["email"])? this.data["email"] : this.data["username"]
            this.data["isNew"] = true;
            this.data["emailField"] = "hidden";
            this.data["nameField"] = "hidden";
        }
        else
        {
            const _data = {};
            _data["_id"] = "";
            _data["name"] = "";
            _data["email"] = "";
            _data["memo"] = ""
            _data["isNew"] = true;
            this.data["emailField"] = "";
            this.data["nameField"] = "";
            Object.assign(this.data, _data);
        }
    }


    async #applyForm()
    {
        try{
            const form = this.querySelector('form');
            const formData = new FormData(form);
            const response = await util.sendFormData(`/contact/add`, "POST", formData);
            if(response.code === 100)
            {
                this.remove();
                this.#showInfoMessage();
                this.sendPostMessage({msg:"COMMAND_ADD_DATA", data:null});
                return;
            }
            else
            {
                alert(response.message)
                console.log(response.message);
            }
        }
        catch (error) {
            console.error('오류:', error);
            alert('실패했습니다.');
        }
        return;
    }

    #showInfoMessage(){

        const info = (globalThis.user) ? {
            title:"문의사항 제출", 
            message:`<p>문의내용이 제출되었습니다.</p>
            <p>답변은 문의하기 게시판에서 확인하세요.</p> 
            <br>빠른 시일내에 답변드리겠습니다.</p>`, 
            close:true
        } : {
            title:"문의사항 제출", 
            message:`<p>문의내용이 제출되었습니다.</p>
            <p>입력하신 이메일로 답변이 전달될 예정입니다.</p> 
            <br>빠른 시일내에 답변드리겠습니다</p>`, 
            close:true
        }
        const component = new InfoMessage(info)
        const modalPage = document.querySelector('modal-page');
        modalPage.appendComponent(component)
    }

  #saveCondition = (form)=>{
        return ( util.checkEmail(form) && this.#checkField(form));
  }
  
  #checkField = (form)=>{
    if(form.name.value.length < 2) {
      alert('이름은 필수입력사항입니다');
      return false;
    }
    else if(form.memo.value.length < 2) {
        alert('내용이 없습니다.');
        return false;
      }
    return true;
  }

    #getTemplate()
    {
        const inner_template = document.createElement('template');
        inner_template.innerHTML = `
        <style>
           
        </style>
        <div class="card">
            <div class="card-header form-header row-space-between">
                <span class="fw-semibold">문의하기</span>
                <button type="button" class="btn btn-icon btn-black command-close-modal">
                <i class="fas fa-times"></i></button>
            </div>
            <div class="card-body">
                <div class="card">
                    <div class="card-body">
                    <form>
                        <input type="hidden" class="form-control" name="user" value="${this.data._id}">
                        <div class="mb-3 ${this.data.nameField}">
                            <label for="name" class="form-label">이름</label>
                            <input type="text" class="form-control" id="name" name="name" value="${this.data.name}">
                        </div>
                        <div class="mb-3 ${this.data.emailField}">
                            <div>
                            <label for="email" class="form-label">이메일</label>
                            <input type="text" class="form-control" id="email" name="email" value="${this.data.email}">
                            </div>
                        </div>
                        <div class="mb-3">
                            <div>
                                <label for="memo" class="form-label">내용</label>
                                <textarea rows="4" class="form-control" id="memo" name="memo"></textarea>
                            </div>
                        </div>
                    </form>
                    </div>
                </div>

                <div class="mt-1 row-space-between">
                    <button type="button" class="btn btn-primary command-save-form">save</button> 
                </div>

            </div>
        </div>
        `;
        return inner_template;
    }

  }
  customElements.define('contact-form', ContactForm);
  
  
  
  
  
   
  
  
  