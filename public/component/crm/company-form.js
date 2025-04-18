class CompanyForm extends AbsForm
{
    constructor()
    {
        super();  
    }
  
    setData(data)
    {
        if(data)
        {
            Object.assign(this.data, store.getInfo('company', '_id', data._id));
            this.data["isNew"] = false;
            this.data["namePlaceHolder"] = "이름이 필요합니다.";
        }
        else
        {
            const _data = {};
            _data["_id"] = "";
            _data["code"] = "";
            _data["name"] = "";
            _data["namePlaceHolder"] = "이름이 필요합니다.";
            _data["fax"] = "";
            _data["tel"] = "";
            _data["website"] = "";
            _data["address"] = "";
            _data["memo"] = "";
            _data["userName"] = globalThis.user.name;
            _data["userId"] = globalThis.user._id;
            _data["isNew"] = true;
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
            
        </style>
        <div class="card">
            <div class="card-header form-header row-space-between">
                <span class="fw-semibold">고객사 정보</span>
                <button type="button" class="btn btn-icon btn-black command-close-modal">
                <i class="fas fa-times"></i></button>
            </div>
            <div class="card-body">
                <div class="card">
                    <div class="card-body">
                    <form>
                        <input type="hidden" name="_id" value="${this.data._id}">
                        <div class="mb-3 row-space-between">
                            <div>
                                <label for="name" class="form-label">고객사 이름 *</label>
                                <input type="text" class="form-control" id="name" name="name" value="${this.data.name}"   required placeholder="${this.data.namePlaceHolder}">
                                <div class="form-text">필수 입력 사항입니다.</div>
                            </div>
                            <div>
                                <label for="code" class="form-label">사업자 번호</label>
                                <input type="text" class="form-control" id="code" name="code"  value="${this.data.code}">
                            </div>
                        </div>

                        <div class="mb-3 row-space-between">
                            <div>
                                <label for="fax" class="form-label">FAX</label>
                                <input type="text" class="form-control" id="fax" name="fax"  value="${this.data.fax}">
                            </div>
                            <div>
                                <label for="tel" class="form-label">연락처</label>
                                <input type="text" class="form-control" id="tel" name="tel"  value="${this.data.tel}">
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="address" class="form-label">주소</label>
                            <input type="text" class="form-control" id="address" name="address"  value="${this.data.address}">
                        </div>

                        <div class="mb-3">
                            <label for="website" class="form-label">홈페이지</label>
                            <input type="text" class="form-control" id="website" name="website"  value="${this.data.website}">
                        </div>

                        <div class="mb-3">
                            <label for="user" class="form-label">담당자</label>
                            <input type="hidden" name="user" value="${this.data.userId}">
                            <input type="text" readonly class="form-control command-show-search-list" id="user" name="userName"  value="${this.data.userName}">
                        </div>

                        <div class="mb-3">
                            <label for="memo" class="form-label">Memo</label>
                            <textarea rows="2" class="form-control" id="memo" name="memo">${this.data.memo}</textarea> 
                        </div>
                    </form>
                    </div>
                </div>
                <div class="mt-1 row-space-between command-group">
                    <div>
                        <button type="button" class="btn btn-link m-1 command-show-delete-button hidden">고객사 정보 삭제</button>
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
  customElements.define('company-form', CompanyForm);
  
  
  
  
  
   
  
  
  