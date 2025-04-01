class PasswordForm extends AbsForm
{
    constructor(data)
    {
        super(); 
        this.addEventListener('click', this.handleClick);
     }
    static get observedAttributes() {return; }
  
    handleClick(e) {
        e.preventDefault();
        e.composedPath().find((node)=>{
          if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
          if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
          if(node.className.match(/command-change-password/))
          {
            // 글자 수 체크
            if(this.#checkLength())
            {
                // 글자 같은지 체크
                if(this.#compareText())
                {
                    this.#updateInfo();
                }
                else alert("비밀번호가 일치하지 않습니다.")
                return;
            }
            else
            {
                alert("비밀번호는 4자 이상입니다.")
            }
            return;
          }
        });
    }

    async #updateInfo()
	{
        try {
            const form = this.querySelector('form');
            const formData = new FormData(form);

            const response = await util.sendFormData("/user/update", "POST", formData);
            if (response.code === 100) {
                
                this.sendPostMessage({msg:"DO_HIDE_MODAL", data:null});
            } else {
                if (response.message) alert(response.message, true);
                else console.dir(response); 
            }
        } catch (error) {
            console.error('비밀번호 변경 중 오류:', error);
            alert('비밀번호 변경에 실패했습니다.');
        }
	}

    #checkLength()
    {
        if(this.querySelector('input[name=password]').value.length > 4) return true;
        else return false;
    }

    #compareText()
    {
        if(this.querySelector('input[name=password]').value === this.querySelector('input[name=re_password]').value) return true;
        else return false;
    }

    render()
    {
        const template = this.#getTemplate();
        this.appendChild(template.content.cloneNode(true));
    }
    
    #getTemplate()
    {
        const inner_template = document.createElement('template');
        inner_template.innerHTML = `
        <style>
            
        </style>
        <div class="card">
            <div class="card-header form-header row-space-between">
                <span class="fw-semibold">비밀번호 변경</span>
                <button type="button" class="btn btn-icon btn-black command-close-modal">
                <i class="fas fa-times"></i></button>
            </div>
            <div class="card-body">
                <div class="card">
                    <div class="card-body">
                    <form>
                        <input type="hidden" value="${globalThis.user._id}" name="_id">
                        <div class="mb-3 row-space-between">
                            <div>
                                <label for="password" class="form-label">변경 비밀번호 *</label>
                                <input type="text" class="form-control" id="password" name="password">
                                <div class="form-text email-info">4자리 이상</div>
                            </div>

                            <div>
                                <label for="re_password" class="form-label">변경 비밀번호 재입력*</label>
                                <input type="text" class="form-control" id="re_password" name="re_password">
                                <div class="form-text email-info">다시한번 입력해주세요</div>
                            </div>
                        </div>
                    </form>
                    </div>
                </div>
                <div class="mt-1">
                    <button type="button" class="btn btn-primary command-change-password">변경</button> 
                </div>

            </div>
        </div>
        `;
        return inner_template;
    }

  }
  customElements.define('password-form', PasswordForm);
  
  
  
  
  
   
  
  
  