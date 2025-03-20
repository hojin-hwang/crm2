class CustomerForm extends AbsForm
{
    constructor()
    {
        super();  
    }

    setData(data)
    {
        if(data)
        {
            Object.assign(this.data, store.getInfo('customer', '_id', data._id));
            this.data["isNew"] = 'update'
        }
        else
        {
            const _data = {};
            _data["_id"] = "";
            _data["company"] = "";
            _data["companyName"] = "";
            _data["name"] = "";
            _data["hp"] = "";
            _data["tel"] = "";
            _data["email"] = "";
            _data["position"] = "";
            _data["department"] = "";
            _data["memo"] = "";
            _data["address"] = "";
            _data["companyAddress"] = "";
            _data["isNew"] = "save";
            _data["userId"] = globalThis.user._id;
            _data["userName"] = globalThis.user.name;
            _data["company"] = "";
            
            Object.assign(this.data, _data);
        }

        Object.keys(this.data).forEach((key)=>{
            if(this.data[key] === null) this.data[key] = "";
        })

    }

    getTemplate()
    {
        const inner_template = document.createElement('template');
        inner_template.innerHTML = `
        <style>
            input[name=companyAddress]{
                background-color: #dfe5ef;
            }
        </style>
        <div class="card">
            <div class="card-header form-header row-space-between">
                <span class="fw-semibold">고객 정보</span>
                <button type="button" class="btn btn-icon btn-black command-close-modal">
                <i class="fas fa-times"></i></button>
            </div>
            <div class="card-body">
                <div class="card">
                    <div class="card-body">
                    <form>
                        <input type="hidden" name="_id" value="${this.data._id}">
                        <input type="hidden" name="user" value="${this.data.userId}">
                        <input type="hidden" name="company" value="${this.data.companyId}">
                        <div class="mb-3 row-space-between">
                            <div>
                                <label for="name" class="form-label">고객 이름 *</label>
                                <input type="text" class="form-control" id="name" name="name" value="${this.data.name}">
                                <div class="form-text">필수 입력 사항입니다.</div>
                            </div>
                            <div>
                                <label for="company" class="form-label">고객사 *</label>
                                <input type="text" class="form-control command-show-search-list" readonly id="company" name="companyName"  value="${this.data.companyName}">
                                <div class="form-text">필수 입력 사항입니다.</div>
                            </div>
                        </div>

                        <div class="mb-3 row-space-between">
                            <div>
                                <label for="position" class="form-label">직책/직위</label>
                                <input type="text" class="form-control" id="position" name="position"  value="${this.data.position}">
                            </div>
                            <div>
                                <label for="department" class="form-label">부서</label>
                                <input type="text" class="form-control" id="department" name="department"  value="${this.data.department}">
                            </div>
                        </div>

                        <div class="mb-3 row-space-between">
                            <div>
                                <label for="hp" class="form-label">hp *</label>
                                <input type="text" class="form-control" id="hp" name="hp"  value="${this.data.hp}">
                                <div class="form-text">입력양식 : 010-1234-5678</div>
                            </div>
                            <div>
                                <label for="tel" class="form-label">연락처</label>
                                <input type="text" class="form-control" id="tel" name="tel"  value="${this.data.tel}">
                                 <div class="form-text">입력양식 : 02-1234-5678</div>
                            </div>
                        </div>

                        <div class="mb-3 row-space-between">
                            <div>
                                <label for="email" class="form-label">email</label>
                                <input type="text" class="form-control" id="email" name="email"  value="${this.data.email}">
                            </div>
                            <div>
                                <label for="user" class="form-label">담당자</label>
                            <input type="text" readonly class="form-control command-show-search-list" id="user" name="userName"  value="${this.data.userName}">
                            </div>
                        </div>
                        <div class="mb-3">
                            <div>
                                <label for="address" class="form-label">고객 주소</label>
                                <input type="text" id="address" class="form-control" name="address" value="${this.data.address}">
                            </div>
                        </div>
                        <div class="mb-3">    
                            <div>
                                <label for="companyAddress" class="form-label">고객사 주소</label>
                                <input type="text" id="companyAddress" class="form-control" readonly name="companyAddress" value="${this.data.companyAddress}">
                            </div>
                        </div>
                        <div class="mb-3">
                            <div>
                                <label for="memo" class="form-label">memo</label>
                                <textarea rows="2" class="form-control" id="memo" name="memo">${this.data.memo}</textarea>
                            </div>
                        </div>

                    </form>
                    </div>
                </div>
                <div class="mt-1 row-space-between">
                    <div>
                        <button type="button" class="btn btn-link m-1 command-show-delete-button hidden">고객 정보 삭제</button>
                        <button type="button" class="btn btn-outline-dark m-1 command-delete-form hidden" data-value="${this.data.id}">삭제하시겠습니까? 삭제해도 과거데이터는 남아있습니다. </button>
                    </div>
                    <button type="button" class="btn btn-primary command-save-form">save</button> 
                </div>
            </div>
        </div>
        `;
        return inner_template;
    }

  }
  customElements.define('customer-form', CustomerForm);
  
  
  
  
  
   
  
  
  