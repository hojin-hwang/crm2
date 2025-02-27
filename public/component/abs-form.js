class AbsForm extends AbstractComponent
{
    constructor()
    {
        super();  
        this.messageListener = this.onMessage.bind(this)
        window.addEventListener("message", this.messageListener);
        this.addEventListener('click', this.handleClick);

        this.data = {};
        this.#initData();
        this.setData();
        
     }
    static get observedAttributes() {return; }
  
    handleClick(e) {
        e.composedPath().find((node) => 
        {
            if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
            if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
            if(node.className.match(/command-show-delete-button/))
            {
                this.querySelector('.command-delete-form').classList.remove('hidden')
                return;
            }
            if(node.className.match(/command-delete-form/))
            {
                const _form = new FormData();
                _form.append('_id', node.dataset.value)
                _form.append('name', 'noname')
                _form.append('company', 'noname')
                _form.append('hp', 'noname')
                store.deleteInfo(_form, this.data.listName, 'COMMAND_CHANGE_DATA');
                this.sendPostMessage({msg:"DO_HIDE_MODAL", data:null});
                return;
            }
            if(node.className.match(/command-save-form/))
            {
                const _form = new FormData(this.querySelector('form'));
                if(this.data.listName === "sales-work-list")
                {
                    if(!_form.get('sheetName'))
                    {
                        alert("영업기회는 필수입니다.");
                        return;
                    }
                }
                if(this.data.isNew === 'update') store.updateInfo(_form, this.data.listName, "COMMAND_CHANGE_DATA");
                else store.addInfo(_form, this.data.listName, "COMMAND_CHANGE_DATA");
                this.sendPostMessage({msg:"DO_HIDE_MODAL", data:null});
                this.sendPostMessage({msg:"HIDE_SEARCH_LIST", data:null});
                return;
            }  
            if(node.className.match(/command-show-search-list/))
            {
                this.#showSearchList(node.getAttribute("id"));
                
                return;
            }          
            if(node.className.match(/command-remove-product/))
            {
                this.deleteProduct(node.dataset.id);
                return;
            } 
            if(node.className.match(/command-remove-material/))
            {
                this.deleteMaterial(node.dataset.id);
                return;
            } 
            if(node.className.match(/command-close-modal/))
            {
                this.sendPostMessage({msg:"DO_HIDE_MODAL", data:null});
                return;
            } 
            if(node.className.match(/command-check-repassword/))
            {
                if(node.checked) this.makePasswordField();
                else this.removePasswordField()
                return;
            }
            if(node.className.match(/command-check-repassword/))
            {
                if(node.checked) this.makePasswordField();
                else this.removePasswordField()
                return;
            }
            if(node.className.match(/command-save-quill/))
            {
                const html = this.quill.getSemanticHTML();
                const title = this.quill.getText(0, 30).replace(/\n/g,' ');

                const form = this.querySelector('form');
                const formData = new FormData(form);
                formData.append("title", title);
                formData.append("contents", html);
                this.addInfo(formData, node);
                
                return;
            }
            if(node.className.match(/command-update-quill/))
            {
                const html = this.quill.getSemanticHTML();
                const title = this.quill.getText(0, 30).replace(/\n/g,' ');
                const form = this.querySelector('form');
                const formData = new FormData(form);
                formData.append("title", title);
                formData.append("contents", html);
                this.updateInfo(formData, node);
                
                return;
            }
            if(node.className.match(/command-delete-contents/))
            {
                if(confirm("삭제할까요?"))
                {
                    const form = this.querySelector('form');
                    const formData = new FormData(form);
                    this.deleteInfo(formData, node);
                }
                
                return;
            }
            if(node.className.match(/command-show-meta-data/))
            {
                //get product name from sheet info
                let productNames = ''; 
                const products = store.getInfo('sales-sheet-list', 'id', this.data.sheet)?.product;
                const producsList = products?.split(',');
                producsList?.forEach(product => {
                    if(!product) return;
                    productNames += store.getInfo('product-list', 'id', product)?.name + '<br>'
                });

                const customer = store.getInfo('customer-list', 'id', this.data.customer);
                const address = customer.address;
                const hp = customer.hp;

                let newText = `${productNames} <hr> ${address} <hr> ${customer.name}(${customer.position}) &nbsp;  hp : ${hp}`;

                this.querySelector('.meta-data-info').innerHTML = newText;
                this.querySelector('.meta-data-info').classList.remove('hidden');
                node.classList.remove('command-show-meta-data');
                node.classList.add('command-toggle-meta-data');
                return;
                //get customer info
            }
            if(node.className.match(/command-toggle-meta-data/))
            {
                const infoDiv = this.querySelector('.meta-data-info');
                infoDiv.classList.toggle('hidden');
                return;
            }
        });
    }
    
    onMessage(event){
        const window_url = window.location.hostname;
        if(event.origin.indexOf(window_url) < 0) return;
        if(event.data.msg)
        {
            switch(event.data.msg)
            {
            case "SET_SEARCH_SELECT":
                this.#updateField(event.data.data);
            break;
            default:
            break;
            }
        }
    }
  
    connectedCallback() {
        this.render();
    }
        
    disconnectedCallback(){
        window.removeEventListener("message", this.messageListener);
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
    }
  
    render()
    {
        const template = this.getTemplate();
        this.appendChild(template.content.cloneNode(true));

        if(this.data["id"]) this.querySelector('.command-show-delete-button').classList.remove('hidden');
        this.loackSave()
    }
    
    loackSave()
    {
        if(globalThis.user.degree !== '관리자' && this.data.user !== globalThis.user.userId)
        {
            this.querySelector('.command-group').remove();
        }
    }

    #initData()
    {
        this.data.formName = this.tagName.toLowerCase();
        this.data.listName = this.tagName.toLowerCase().replace('form', 'list');
    }

    #showSearchList(target)
    {
        const config = this.#getSearchConfig(target);

        const searchList = document.querySelector('search-list');
        const info = {
            listName : config.listName,
            columns :  [
                            { "data": "id", "title":"id"},
                            { "data": config.columnData, "title":config.columnTitle}
                        ],
            title : config.title,
            formName : this.data.formName,
            targetField : config.field
        }
        searchList.setData(info)
    }

    #getSearchConfig(target)
    {
        const config = {};
        config.columnData = "name"
        config.columnTitle = "이름"
        if(target === 'customer') {
            config.title = "고객 찾기"
            config.field = "customer"
            config.listName = "customer-list"
        }
        else if(target === 'user') {
            config.title = "담당자 찾기"
            config.field = "user"
            config.listName = "user-list"
        }
        else if(target === 'company') {
            config.title = "고객사 찾기"
            config.field = "company"
            config.listName = "company-list"
        }
        else if(target === 'product') {
            config.title = "제품 찾기"
            config.field = "product"
            config.listName = "product-list"
        }
        else if(target === 'item') {
            config.title = "품목 찾기"
            config.field = "product"
            config.listName = "item-list"
        }
        else if(target === 'material') {
            config.title = "원재료 찾기"
            config.field = "material"
            config.listName = "material-list"
        }
        else{
            config.title = "일지 찾기"
            config.field = "sheet"
            config.listName = "sales-sheet-list"
        }
        return config;
    }

    #updateField(info)
    {
        if(this.tagName !== info.tagName.toUpperCase()) return;

        if(info.field === 'product')
        {
            this.addProduct(info.info.id, info.info.name);
            return;
        }
        if(info.field === 'material')
        {
            this.addMaterial(info.info.id, info.info.name);
            return;
        }
        else if(info.field === 'company')
        {
            this.querySelector('input[name=company]').value = info.info.id;
            this.querySelector('input[name=companyName]').value = info.info.name;
            this.querySelector('input[name=companyAddress]').value = info.info.address;
            this.querySelector('input[name=address]').value = info.info.address;
        }
        else if(info.field === 'user')
        {
            this.querySelector('input[name=user]').value = info.info.id;
            this.querySelector('input[name=userName]').value = info.info.name;
        }
        else if(info.field === 'customer')
        {
            this.querySelector('input[name=customer]').value = info.info.id;
            this.querySelector('input[name=customerName]').value = info.info.name;

            this.querySelector('input[name=company]').value = info.info.company;
            this.querySelector('input[name=companyName]').value = info.info.companyName
        }
        else if(info.field === 'sheet')
        {
            this.querySelector('input[name=sheet]').value = info.info.id;
            this.querySelector('input[name=sheetName]').value = info.info.name;

            this.querySelector('input[name=customer]').value = info.info.customer;
            this.querySelector('input[name=customerName]').value = info.info.customerName;

            this.querySelector('input[name=company]').value = info.info.company;
            this.querySelector('input[name=companyName]').value = info.info.companyName;
        }
        else 
        {
            this.querySelector(`input[name=${info.field}]`).value = info.info.id;
            this.querySelector(`input[name=${info.field}Name]`).value = info.info.name;
        }
        // const _infoFieldId = `${info.field}Name`;
        // this.querySelector(`input[name=${_infoFieldId}]`).value = info.info.name;
    }
  }
  
  
  
  
  
   
  
  
  