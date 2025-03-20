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
                store.deleteInfo(_form, this.data.collection, 'COMMAND_CHANGE_DATA');
                this.sendPostMessage({msg:"DO_HIDE_MODAL", data:null});
                return;
            }
            if(node.className.match(/command-save-form/))
            {
                const _form = new FormData(this.querySelector('form'));
                if(this.data.collection === "sales")
                {
                    if(!_form.get('sheetName'))
                    {
                        alert("영업기회는 필수입니다.");
                        return;
                    }
                }
                if(this.data.isNew === 'update') store.updateInfo(_form, this.data.collection, "COMMAND_CHANGE_DATA");
                else store.addInfo(_form, this.data.collection, "COMMAND_CHANGE_DATA");
                this.sendPostMessage({msg:"DO_HIDE_MODAL", data:null});
                this.sendPostMessage({msg:"HIDE_SEARCH_LIST", data:null});
                return;
            }  
            if(node.className.match(/command-show-search-list/))
            {
                this.#showSearchList(node.getAttribute("id"));
                
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
                store.addInfo(formData, 'board', "COMMAND_CHANGE_DATA");
                this.sendPostMessage({msg:"DO_HIDE_MODAL", data:null});
                this.sendPostMessage({msg:"HIDE_SEARCH_LIST", data:null});
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
                //this.updateInfo(formData, node);
                store.updateInfo(formData, 'board', "COMMAND_CHANGE_DATA");
                this.sendPostMessage({msg:"DO_HIDE_MODAL", data:null});
                this.sendPostMessage({msg:"HIDE_SEARCH_LIST", data:null});
                this.#showAlert("저장되었습니다.");
                return;
            }
            if(node.className.match(/command-delete-contents/))
            {
                if(confirm("삭제할까요?"))
                {
                    const form = this.querySelector('form');
                    const formData = new FormData(form);
                    store.deleteInfo(formData, 'board', 'COMMAND_CHANGE_DATA');
                    this.sendPostMessage({msg:"DO_HIDE_MODAL", data:null});
                    //this.deleteInfo(formData, node);
                }
                
                return;
            }
            if(node.className.match(/command-show-meta-data/))
            {
                //get product name from sheet info
                let productNames = ''; 
                const products = store.getInfo('sheet', '_id', this.data.sheetId)?.product;
                products?.forEach(product => {
                    if(!product) return;
                    productNames += store.getInfo('product', '_id', product.id)?.name + '<br>'
                });

                const customer = store.getInfo('customer', '_id', this.data.customerId);
                const address = customer.address;
                const hp = customer.hp;

                let newText = `${productNames} <hr> ${address} <hr> ${customer.name}(${customer.position}) &nbsp;  hp : ${hp}`;

                // this.querySelector('.meta-data-info').innerHTML = newText;
                // this.querySelector('.meta-data-info').classList.remove('hidden');
                node.classList.remove('command-show-meta-data');
                // node.classList.add('command-toggle-meta-data');
                this.querySelector('.accordion-body').innerHTML = newText;
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
    
    setData()
    {}

    connectedCallback() {
        this.render();
    }
        
    disconnectedCallback(){
        window.removeEventListener("message", this.messageListener);
        this.removeEventListener("click", this.handleClick);
        this.data = {};
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
    }
  
    render()
    {
        const template = this.getTemplate();
        this.appendChild(template.content.cloneNode(true));

        this.showDelete();
        this.showSave();
        this.afterRender();

    }
    
    afterRender()
    {
        
    }

    showDelete()
    {
        if(this.#isAuthorized() && this.data.isNew !== 'save') this.querySelector('.command-show-delete-button').classList.remove('hidden');
    }

    showSave()
    {   
        if(this.data.isNew === 'save') return;
        if(!this.#isAuthorized())
        {
            this.querySelector('.command-save-form').classList.add('hidden');
        }
    }

    #isAuthorized()
    {
        if(globalThis.user.degree === '관리자') return true;
        if(this.data.userId === globalThis.user._id) return true;
        return false;
    }

    #initData()
    {
        this.data.formName = this.tagName.toLowerCase();
        this.data.listName = this.tagName.toLowerCase().replace('form', 'list');
        this.data.collection = this.tagName.toLowerCase().replace('-form', '');
    }

    #showSearchList(target)
    {
        const config = this.#getSearchConfig(target);

        const searchList = document.querySelector('search-list');
        const info = {
            collection : config.name,
            columns :  [
                            { "data": "_id", "title":"id"},
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
            config.name = "customer"
        }
        else if(target === 'user') {
            config.title = "담당자 찾기"
            config.field = "user"
            config.name = "user"
        }
        else if(target === 'company') {
            config.title = "고객사 찾기"
            config.field = "company"
            config.name = "company"
        }
        else if(target === 'product') {
            config.title = "품목 찾기"
            config.field = "product"
            config.name = "product"
        }
        else{
            config.title = "일지 찾기"
            config.field = "sheet"
            config.name = "sheet"
        }
        return config;
    }

    #updateField(info)
    {
        if(this.tagName !== info.tagName.toUpperCase()) return;

        if(info.field === 'product')
        {
            // if(this.hasProduct(info.info._id)) return;
            // this.addProductButton(info.info, info.info.name);
            // this.addProductData(info.info._id,"product");
            // this.setProductInField();

            return;
        }
        if(info.field === 'material')
        {
            // if(this.hasProduct(info.info._id)) return;
            // this.addMaterialButton(info.info._id, info.info.name);
            // this.addProductData(info.info._id,"material");
            // this.setProductInField();
            return;
        }
        else if(info.field === 'company')
        {
            this.querySelector('input[name=company]').value = info.info._id;
            this.querySelector('input[name=companyName]').value = info.info.name;
            this.querySelector('input[name=companyAddress]').value = info.info.address;
            this.querySelector('input[name=address]').value = info.info.address;
        }
        else if(info.field === 'user')
        {
            this.querySelector('input[name=user]').value = info.info._id;
            this.querySelector('input[name=userName]').value = info.info.name;
        }
        else if(info.field === 'customer')
        {
            this.querySelector('input[name=customer]').value = info.info._id;
            this.querySelector('input[name=customerName]').value = info.info.name;

            this.querySelector('input[name=company]').value = info.info.companyId;
            this.querySelector('input[name=companyName]').value = info.info.companyName
        }
        else if(info.field === 'sheet')
        {
            this.querySelector('input[name=sheet]').value = info.info._id;
            this.querySelector('input[name=sheetName]').value = info.info.name;

            this.querySelector('input[name=customer]').value = info.info.customerId;
            this.querySelector('input[name=customerName]').value = info.info.customerName;

            this.querySelector('input[name=company]').value = info.info.companyId;
            this.querySelector('input[name=companyName]').value = info.info.companyName;
        }
        else 
        {
            this.querySelector(`input[name=${info.field}]`).value = info.info._id;
            this.querySelector(`input[name=${info.field}Name]`).value = info.info.name;
        }
        // const _infoFieldId = `${info.field}Name`;
        // this.querySelector(`input[name=${_infoFieldId}]`).value = info.info.name;
    }

    #showAlert(message)
    {
        new AlertMessage(message);
    }    
  }
  
  
  
  
  
   
  
  
  