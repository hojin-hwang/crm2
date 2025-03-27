class ApplyForm extends HTMLElement
{
    constructor()
    {
        super();  
        this.addEventListener('click', this.handleClick);
    }

    static get observedAttributes(){return [];} 

    attributeChangedCallback(name, oldValue, newValue)
    {
        this[name] = newValue;
    }

    handleClick(e) {
        e.composedPath().find((node)=>{
        if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
        if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
        if(node.className.match(/command-check-terms/))
        {
            if(!this.#applyCondition(node)) 
            {
                if(node.checked) node.checked = false
                return;
            }
            if(node.checked)
            {
                this.querySelector('.command-add-apply').removeAttribute('disabled') 
            }
            else this.querySelector('.command-add-apply').setAttribute('disabled',true)
            return;
        }
        if(node.className.match(/command-add-apply/))
        {
            if(!this.#applyCondition(node)) return;
            this.#applyForm();
            return;
        }
        if(node.className.match(/command-show-terms/))
        {
            document.querySelectorAll(".nav-link").forEach(link => link.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('active','show'));

            document.getElementById("line-terms-tab").classList.add('active')
            document.getElementById("line-terms").classList.add('active', 'show')
            return;
        }
        if(node.className.match(/command-show-policy/))
        {
            document.querySelectorAll(".nav-link").forEach(link => link.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('active','show'));

            document.getElementById("line-policy-tab").classList.add('active')
            document.getElementById("line-policy").classList.add('active', 'show')
            return;
        }
        if(node.className.match(/command-close-modal/))
        {
            this.#closeForm()
        
        return;
        }

        })
    }

    connectedCallback()
    {
        this.render();
    }

    disconnectedCallback()
    {
        window.removeEventListener("message", this.messageListener)
        this.removeEventListener("click", this.handleClick)
    }

    render()
    {
        const template = this.getTemplate();
        this.appendChild(template.content.cloneNode(true));
    }

    async #applyForm()
    {
        try{
            const form = this.querySelector('form');
            const formData = new FormData(form);
            const response = await util.sendFormData(`/apply/add`, "POST", formData);
            if(response.code === 100)
            {
                const modalPage = document.querySelector('modal-page');
                const info = {
                    title:"신청서 제출", 
                    message:"<p>신청서가 제출되었습니다.</p><p>영업일 기준으로 24시간내에 처리됩니다.</p> <br> 승인후 정보는 메일로 보내집니다.</p>", 
                    close:true
                }
                const component = new InfoMessage(info)
                modalPage.appendComponent(component)
                this.#closeForm()
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

    #closeForm()
    {
        this.remove();
        document.querySelector('apply-condition').remove();
        document.querySelector('.form-login').classList.remove('hidden')
        document.querySelector('.index-info').classList.remove('hidden')
    }

    #applyCondition = (node)=>{
        const form = node.closest('form');
		return ( this.#checkEmail(form) && this.#checkName(form) && this.#checkClientId(form));
    }

    #checkEmail = (form)=>{
        if(form.username.value.length < 1) {
          alert('이메일은 필수입력사항입니다');
          return false;
        }
        else
        {
          const regEmail = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i
          if(!regEmail.test(form.username.value)) {
              alert('이메일 형식에 따라 정확히 입력해주세요');
              return false;
          }
        }
        return true;
      }
      #checkName = (form)=>{
        if(form.name.value.length < 2) {
          alert('이름은 2자 이상이어야 합니다');
          return false;
        }
        return true;
      }
      #checkClientId = (form)=>{
        if(form.clientId.value.length < 3) {
          alert('client는 3자 이상이어야 합니다');
          return false;
        }
        return true;
      }

    getTemplate()
    {
        const inner_template = document.createElement('template');
        inner_template.innerHTML = `
        <style>
            
        </style>
        <div class="card card-round">
            <div class="card-header form-header row-space-between">
                <span>SS CRM 사용신청</span>
                <button type="button" class="btn btn-icon btn-black command-close-modal">
                <i class="fas fa-times"></i></button>
            </div>
            <div class="card-body">
                <form>
                    <div class="form-group">
                        <label for="clientId">Client ID*</label>
                        <input type="text" class="form-control" id="clientId" name="clientId" placeholder="client Id" autocomplete="clientId">
                        <small id="clientIdHelp" class="form-text text-muted">영문, 붙여쓰세요</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="username">Email Address*</label>
                        <input type="text" class="form-control" id="username" name="email" placeholder="Enter Email" autocomplete="username">
                        <small id="usernameHelp" class="form-text text-muted"></small>
                    </div>

                    <div class="form-group">
                        <label for="name">신청자 이름*</label>
                        <input type="text" class="form-control" id="name" name="name" placeholder="신청자 이름" autocomplete="name">
                        <small id="nameHelp" class="form-text text-muted"></small>
                    </div>

                    <div class="form-group">
                        <label for="site">홈페이지</label>
                        <input type="text" class="form-control" id="site" name="site" autocomplete="site" placeholder="https://homepage.com">
                    </div>

                    <div class="form-group">
                        <label for="tel">연락처</label>
                        <input type="text" class="form-control" id="tel" name="tel" autocomplete="tel" placeholder="01012341234">
                    </div>
                    <div class="form-check">
                        <input class="form-check-input command-check-terms" type="checkbox" value="" id="flexCheckDefault">
                        <label class="form-check-label" for="flexCheckDefault">
                        <a href="#" class="command-show-terms">이용약관</a>과 <a href="#" class="command-show-policy">개인정보정책</a>에 동의
                        </label>
                    </div>
                    <div class="form-group">
                        <button type="button" class="command-add-apply btn btn-primary" disabled>신청하기</button>
                    </div>
                </form>
            </div>
        </div>
        `;
        return inner_template;
    }

  }
  customElements.define('apply-form', ApplyForm);
  
  
  
  
  
   
  
  
  