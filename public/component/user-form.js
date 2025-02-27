class UserForm extends AbsForm
{
    constructor()
    {
        super();  
        this.setData();
     }
    static get observedAttributes() {return; }
  

    render()
    {
        const template = this.#getTemplate();
        this.appendChild(template.content.cloneNode(true));
        util.selectOption(this, '#user_department', this.data["department"])
        util.selectOption(this, '#user_position', this.data["position"])
        util.selectOption(this, '#user_degree', this.data["degree"])

        if(this.data["username"]) {
            this.querySelector('.command-show-delete-button').classList.remove('hidden')
            this.querySelector('.email-info').innerHTML = 'email은 필수입니다.'
            this.querySelector('input[name=username]').setAttribute('readonly', true);
        }
        else{
            this.makePasswordField();
            this.querySelector('.repassword-check').classList.add('hidden')
            
        }    
    }
    
    setData(data)
    {
        if(data)
        {
            Object.assign(this.data, store.getInfo(this.data.listName,'_id', data._id));
            this.data["isNew"] = "update";
        }
        else
        {
            const _data = {};
            _data["_id"] = "";
            _data["username"] = "";
            _data["password"] = "sooyk@1234";
            _data["code"] = "";
            _data["name"] = "";
            _data["department"] = "";
            _data["position"] = "";
            _data["degree"] = "일반";
            _data["isNew"] = "save";
            Object.assign(this.data, _data);
        }
    }

    makePasswordField()
    {
        const form = this.querySelector('form');
        const input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('value' , 'sooyk@1234');
        input.setAttribute('name' , 'password');
        form.appendChild(input);
        const input2 = document.createElement('input');
        input2.setAttribute('type', 'hidden');
        input2.setAttribute('value' , 'sooyk@1234');
        input2.setAttribute('name' , 'repassword');
        form.appendChild(input2);
    }

    removePasswordField()
    {
        const input = this.querySelector('input[name=password]');
        const input2 = this.querySelector('input[name=repassword]');
        input?.remove();
        input2?.remove();
    }

    #getTemplate()
    {
        const inner_template = document.createElement('template');
        inner_template.innerHTML = `
        <style>
            
        </style>
        <div class="card">
            <div class="card-header" style="padding-top: 12px;padding-bottom: 12px">
                <span class="fw-semibold">사용자 정보</span>
                <button type="button" class="btn btn-outline-link m-1 command-close-modal"><i class="ti ti-x fs-8"></i></button>
            </div>
            <div class="card-body">
                <div class="card">
                    <div class="card-body">
                    <form>
                        <input type="hidden" value="${this.data._id}" name="_id">
        
                        <div class="mb-3 row-space-between">
                            <div>
                                <label for="email" class="form-label">Email *</label>
                                <input type="text" class="form-control" id="email" name="username" value="${this.data.username}">
                                <div class="form-text email-info">신규 사용자 초기 비밀번호는 sooyk@1234 입니다</div>
                            </div>
                            
                        </div>

                        <div class="mb-3 repassword-check">
                            <label for="init_password" class="form-label">비밀번호 초기화</label>
                            <div>
                            <input type="checkbox" class="form-check-input command-check-repassword" id="repassword">
                            <label for="init_repassword" class="form-check-label" for="repassword">sooyk@1234로 초기화</label>
                            </div>
                        </div>
                        <hr>
                        <div class="mb-3 row-space-between">
                            <div>
                                <label for="code" class="form-label">사원코드</label>
                                <input type="text" class="form-control" id="code" name="code" value="${this.data.code}">
                            </div>
                            <div>
                                <label for="user_name" class="form-label">이름</label>
                                <input type="text" class="form-control" id="user_name" name="name" value="${this.data.name}">
                            </div>
                        </div>
                        
                        <div class="mb-3 row-space-between">
                            <div>
                                <label for="user_department" class="form-label">부서</label>
                                <select name="department" id="user_department" class="form-select">
                                    <option value="경영진">경영진</option>
                                    <option value="생산부">생산부</option>
                                    <option value="관리부">관리부</option>
                                    <option value="영업부">영업부</option>
                                    <option value="기타">기타</option>
                                </select>
                            </div>
                            <div>
                            <label for="user_position" class="form-label mb-3">직급</label>
                                <select name="position" id="user_position" class="form-select">
                                    <option value="사원">사원</option>
                                    <option value="주임">주임</option>
                                    <option value="대리">대리</option>
                                    <option value="과장">과장</option>
                                    <option value="차장">차장</option>
                                    <option value="부장">부장</option>
                                    <option value="이사">이사</option>
                                    <option value="대표">대표</option>
                                </select>
                            </div>

                            <div class="mb-3 row-space-between">
                                <div>
                                    <label for="user_degree" class="form-label mb-3">상태</label>
                                        <select name="degree" id="user_degree" class="form-select">
                                            <option value="대기">대기</option>
                                            <option value="일반">일반</option>
                                            <option value="관리자">관리자</option>
                                        </select>
                                </div>
                            </div>         
                        </div>
                        
                    </form>
                    </div>
                </div>
                <div class="mt-1 row-space-between">
                    <div>
                        <button type="button" class="btn btn-link m-1 command-show-delete-button hidden">사용자 정보 삭제</button>
                        <button type="button" class="btn btn-outline-dark m-1 command-delete-form hidden" data-value="${this.data._id}">삭제하시겠습니까? 삭제해도 과거데이터는 남아있습니다. </button>
                    </div>
                    <button type="button" class="btn btn-primary command-save-form">save</button> 
                </div>

            </div>
        </div>
        `;
        return inner_template;
    }

  }
  customElements.define('user-form', UserForm);
  
  
  
  
  
   
  
  
  