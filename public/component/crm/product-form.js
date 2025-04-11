class ProductForm extends AbsForm
{
    constructor()
    {
        super();  
    }

    render()
    {
        const template = this.#getTemplate();
        this.appendChild(template.content.cloneNode(true));
        util.selectOption(this, '#code', this.data["code"].replaceAll('[','').replaceAll(']',''));
        if(!this.data["isNew"]) this.querySelector('.command-show-delete-button').classList.remove('hidden')
    }
    
    setData(data)
    {
        if(data)
        {
            
            Object.assign(this.data, store.getInfo('product','_id', data._id));
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
            _data["brand"] = "";
            _data["memo"] = ""
            _data["user"] = globalThis.user.name;
            _data["isNew"] = true;
            Object.assign(this.data, _data);
        }
    }

    #getTemplate()
    {
        const inner_template = document.createElement('template');
        inner_template.innerHTML = `
        <style>
           
        </style>
        <div class="card">
            <div class="card-header form-header row-space-between">
                <span class="fw-semibold">품목 정보</span>
                <button type="button" class="btn btn-icon btn-black command-close-modal">
                <i class="fas fa-times"></i></button>
            </div>
            <div class="card-body">
                <div class="card">
                    <div class="card-body">
                    <form>
                        <input type="hidden" value="${this.data._id}" name="_id">
                        <div class="mb-3">

                            <label for="code" class="form-label">품목코드 *</label>
                            <select name="code" id="code" class="form-select">
                                <option value="원재료">원재료</option>
                                <option value="상품">상품</option>
                                <option value="제품">제품</option>
                            </select>

                        </div>
                        <div class="mb-3">
                            <label for="product_name" class="form-label">품목명</label>
                            <input type="text" class="form-control" id="product_name" name="name" value="${this.data.name}"   required placeholder="${this.data.namePlaceHolder}">
                        </div>
                        <div class="mb-3">
                            <div>
                            <label for="brand" class="form-label">제조사</label>
                            <input type="text" class="form-control" id="brand" name="brand"  value="${this.data.brand}">
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
                        <button type="button" class="btn btn-link m-1 command-show-delete-button hidden">제품 정보 삭제</button>
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
  customElements.define('product-form', ProductForm);
  
  
  
  
  
   
  
  
  