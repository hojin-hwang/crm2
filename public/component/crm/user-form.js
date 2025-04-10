// 상수 정의 ClientInfo로 빼자..
const FORM_CONFIG = {
    departments: ['경영진', '생산부', '관리부', '영업부', '기타'],
    positions: ['사원', '주임', '대리', '과장', '차장', '부장', '이사', '대표'],
    degrees: ['대기', '일반', '관리자']
};
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
        
        // 선택 옵션 초기화
        this.#initializeSelectOptions();
        
        // 사용자 상태에 따른 UI 처리
        this.#handleUserState();
    }
    
    setData(data)
    {
        if(data)
        {
            Object.assign(this.data, store.getInfo('user','_id', data._id));
            this.data["isNew"] = false;
            FORM_CONFIG.degrees = ['대기', '일반','관리자']
        }
        else
        {
            const defaultData = {
                _id: "",
                username: "",
                password: globalThis.user.clientInfo.authCode,
                code: "",
                name: "",
                department: "",
                position: "",
                degree: "일반",
                isNew: "save"
            };
            Object.assign(this.data, defaultData);
            FORM_CONFIG.degrees = ['대기', '일반']
        }
    }

    #initializeSelectOptions() {
        util.selectOption(this, '#user_department', this.data["department"]);
        util.selectOption(this, '#user_position', this.data["position"]);
        util.selectOption(this, '#user_degree', this.data["degree"]);
    }

    #handleUserState() {
        if (this.data["username"]) {
            this.#handleExistingUser();
            this.#exceptSuperUser();
        } else {
            this.#handleNewUser();
        }
    }

    #exceptSuperUser()
    {
        if(this.data["username"] === 'admin')
        {
            this.querySelector('.command-save-form').classList.add('hidden');
            this.querySelector('.action-zone').classList.add('hidden');
        }
    }

    #handleExistingUser() {
        this.querySelector('.command-show-delete-button').classList.remove('hidden');
        this.querySelector('.email-info').innerHTML = 'email은 필수입니다.';
        this.querySelector('input[name=username]').setAttribute('readonly', true);
    }

    #handleNewUser() {
        this.makePasswordField();
        this.querySelector('.repassword-check').classList.add('hidden');
    }

    makePasswordField()
    {
        const form = this.querySelector('form');
        const passwordFields = [
            { name: 'password', value: globalThis.user.clientInfo.authCode },
            { name: 'repassword', value: globalThis.user.clientInfo.authCode }
        ];

        passwordFields.forEach(field => {
            const input = document.createElement('input');
            input.setAttribute('type', 'hidden');
            input.setAttribute('value', field.value);
            input.setAttribute('name', field.name);
            form.appendChild(input);
        });
    }

    removePasswordField()
    {
        ['password', 'repassword'].forEach(name => {
            this.querySelector(`input[name=${name}]`)?.remove();
        });
    }


    #getTemplate()
    {
        const inner_template = document.createElement('template');
        inner_template.innerHTML = `
        <style>
            .card-header {
                padding: 12px;
            }
            .row-space-between {
                display: flex;
                gap: 1rem;
            }
            .row-space-between > div {
                flex: 1;
            }
        </style>
        <div class="card">
            <div class="card-header form-header row-space-between">
                <span class="fw-semibold">사용자 정보</span>
                <button type="button" class="btn btn-icon btn-black command-close-modal">
                <i class="fas fa-times"></i></button>
            </div>
            <div class="card-body">
                <div class="card">
                    <div class="card-body">
                    <form>
                        <input type="hidden" value="${this.data._id}" name="_id">
                        <input type="hidden" value="${globalThis.user.clientId}" name="clientId">
                        <div class="mb-3 row-space-between">
                            <div>
                                <label for="email" class="form-label">Email *</label>
                                <input type="text" class="form-control" id="email" name="username" value="${this.data.username}">
                                <div class="form-text email-info">신규 사용자 초기 비밀번호는 ${globalThis.user.clientInfo.authCode} 입니다</div>
                            </div>
                            
                        </div>

                        <div class="mb-3 repassword-check">
                            <label for="repassword" class="form-label">비밀번호 초기화</label>
                            <div>
                            <input type="checkbox" class="form-check-input command-check-repassword" id="repassword">
                            <label for="repassword" class="form-check-label">${globalThis.user.clientInfo.authCode}로 초기화</label>
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
                                    ${FORM_CONFIG.departments.map(dept => 
                                        `<option value="${dept}">${dept}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div>
                            <label for="user_position" class="form-label mb-3">직급</label>
                                <select name="position" id="user_position" class="form-select">
                                    ${FORM_CONFIG.positions.map(pos => 
                                        `<option value="${pos}">${pos}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div>
                                <label for="user_degree" class="form-label mb-3">상태</label>
                                    <select name="degree" id="user_degree" class="form-select">
                                        ${FORM_CONFIG.degrees.map(deg => 
                                            `<option value="${deg}">${deg}</option>`
                                        ).join('')}
                                    </select>
                            </div>
                        </div>
                        
                    </form>
                    </div>
                </div>
                <div class="mt-1 row-space-between action-zone">
                    <div>
                        <button type="button" class="btn btn-link m-1 command-show-delete-button hidden">사용자 정보 삭제</button>
                        <button type="button" class="btn btn-outline-dark m-1 command-delete-form hidden" data-value="${this.data._id}">삭제하시겠습니까? </button>
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
  
  
  
  
  
   
  
  
  