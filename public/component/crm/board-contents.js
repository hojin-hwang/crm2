class BoardContents extends AbsForm
{
    constructor(data)
    {
        super();
        this.#setData(data); 
    }

    static get observedAttributes() {return ['editable','id', 'boardid', 'new']; }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if(name == 'editable') this["editable"] = JSON.parse(newValue);
    } 


    #setData(data)
    {
        if(data.isNew)
        {
            Object.assign(this.data, data);
            this.data["companyId"] = "";
            this.data["customerId"] = "";
            this.data["userName"] = globalThis.user.name;
            this.data["userId"] = globalThis.user._id;
            this.data["duedate"] = util.getDayDashFormat(new Date())
            
        }
        else
        {
            Object.assign(this.data, data);
        }

        Object.keys(this.data).forEach((key)=>{
            if(this.data[key] === null) this.data[key] = "";
        })
        
        
    }

    #setContentsForm()
    {
        // this.querySelector('input[name=id]').value = (this.data.id)? this.data.id:"";
        this.querySelector('input[name=_id]').value = (this.data._id)? this.data._id:"";
        this.querySelector('input[name=customer]').value = (this.data.customerId)? this.data.customerId:"";
        this.querySelector('input[name=customerName]').value = (this.data.customerName)? this.data.customerName:"";
        this.querySelector('input[name=company]').value = (this.data.companyId)? this.data.companyId : "";
        this.querySelector('input[name=companyName]').value = (this.data.customerName)? this.data.customerName:"";
        this.querySelector('input[name=duedate]').value = (this.data.duedate)? this.data.duedate.substring(0,10): util.getDayDashFormat(new Date());
    
        this.#appendProductLoad(this.data.product, this.#isAuthorized())
        this.quill.clipboard.dangerouslyPasteHTML(0, this.data.contents);
        this.querySelector('board-check').setData(this.data);
    }

    #changeButton()
    {
        const button = this.querySelector('.action-button')
        if(this.data.isNew)
        {
            button.classList.add('command-save-quill');
            button.innerText = "SAVE";
        }
        else
        {
            button.classList.remove('command-save-quill');
            button.classList.add('command-update-quill');
            button.innerText = "UPDATE";

            const deleteButton = this.querySelector('.delete-button')
            deleteButton.style.display = 'inline-block';
        }
    }

    render()
    {
        const template = this.getTemplate();
        this.appendChild(template.content.cloneNode(true));
        this.#setInit();
        
        if(this.data.isNew)
        {
            this.data.contents = '<p><br /></p>'; 
            this.#showActionButton()
            this.#appendProductLoad([], true);
        }
        else
        {
            this.#setContentsForm();
            if(!this.#isAuthorized()) 
            {
                this.#unabledEditable();
                this.quill.enable(false);
            }
            else this.#showActionButton();
        }    
            

        this.#changeButton();
        if(document.querySelector('table-list').info.tag !== 'notice') this.#showSecondInfo()
    }

    #isAuthorized()
    {
        if(globalThis.user.degree === '관리자') return true;
        if(this.data.userId === globalThis.user._id) return true;
        return false;
    }

    #showSecondInfo()
    {
        this.querySelector('form').classList.remove('hidden')
    }

    #showActionButton()
    {
        this.querySelector('.action-section').classList.remove('hidden');
    }

    #unabledEditable()
    {
        this.querySelector('input[name=customerName]').disabled = true;
        this.querySelector('input[name=companyName]').disabled = true;
        this.querySelector('input[name=duedate]').disabled = true;
        this.querySelector('.option-text').classList.add('hidden');
    }

    #setInit()
    {
        const toolbarOptions = (this.#isAuthorized())? [
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'], 
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['clean']
        ]:null;

        this.quill = new Quill('#editor', {
            modules: {
                toolbar: toolbarOptions
                },
            placeholder: '내용을 기입해주세요.',
            theme: 'snow',
            readOnly:false
        });
    }

    #appendProductLoad(list, editable)
    {
        this.querySelector('.product-zone').appendChild(new ProductUpload(list, editable))
    }

    getTemplate()
    {
        const inner_template = document.createElement('template');
        inner_template.innerHTML = `
        <style>
            #editor{
                min-height: 100px;
                max-height: 200px;
                overflow: auto;
            }
            .delete-button{
                display:none;
            }
            .customer-company-zone
            {
                align-items: start;
                padding-top: 12px;
                border-bottom: 1px solid #eee;
                padding-bottom: 12px;
                border-top: 1px solid #eee;
                margin-top: 12px;
            }
                
        </style>
        
        <div id="editor">
            
	    </div>
        <board-check contentsid="${this.data.id}"></board-check>
        <form class="hidden">
            <input type="hidden" name="_id" value="${this.data["_id"]}"> 
            <input type="hidden" name="boardId" value="${this.data["boardId"]}">   
            <input type="hidden" name="customer" value="${this.data["customerId"]}">
            <input type="hidden" name="company" value="${this.data["companyId"]}">
            <input type="hidden" name="user" value="${this.data["userId"]}">
            <div class="mb-3 row-space-between customer-company-zone">
                <div>
                    <label for="customer" class="form-label">고객</label>
                    <input type="text" readonly="" class="form-control command-show-search-list" id="customer" name="customerName" value="">
                    <div class="form-text option-text">고객을 선택해주세요</div>
                </div>
                <div>
                    <label for="company" class="form-label">고객사</label>
                    <input type="text" readonly="" class="form-control" id="company" name="companyName" value="">
                </div>
                <div>
                    <label for="duedate" class="form-label">날짜</label>
                    <input type="date" class="form-control" id="duedate" name="duedate" value="${this.data["duedate"]}">
                </div>
            </div>
            <div class="mb-3 product-zone">
                <!--<div class="row-space-between" >
                    <label for="product" class="form-label">품목</label>
                    <button type="button" class="btn btn-primary product-add-butto command-show-search-list" id="product" >+</button> 
                </div>
                <div class="product-group"></div>-->
            </div>
        </form>
        
        <div class="pt-3 mb-3 row-space-between">
            <div class="action-section hidden">
                <button class="btn btn-danger delete-button command-delete-contents" type="button">Delete</button>
                <button class="btn btn-primary action-button" type="button">SAVE</button>
            </div>
            
        </div>
        
        `;
        return inner_template;
    }

  }
  customElements.define('board-contents', BoardContents);