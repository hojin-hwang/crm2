
class ProductUpload extends AbstractComponent
{
    constructor(list, editable = false)
    {
        super();  
        this.messageListener = this.onMessage.bind(this)
        window.addEventListener("message", this.messageListener);
        this.data = {}
        this.data.editable = editable;
        this.data.product = (list)? list : [];
    }

    static get observedAttributes() {return; }
    
    handleClick(e) {
        e.composedPath().find((node) => 
        {
            if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
            if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
            if(node.className.match(/command-show-search-list/))
            {
                this.#showSearchList();
                return;
            }
            if(node.className.match(/command-remove-product/))
            {
                this.#deleteProduct(node.dataset.id);
                return;
            } 
        }
    )}

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

    connectedCallback()
    {
      this.#render();  
    }

    disconnectedCallback(){
        window.removeEventListener("message", this.messageListener);
        this.removeEventListener("click", this.handleClick);
        this.data = {};
    }

    #updateField(info)
    {

        if(info.field === 'product')
        {
            if(this.#hasProduct(info.info._id)) return;
            this.#addProductButton(info.info, info.info.name);
            this.#addProductData(info.info);
            this.#setProductInField();

            return;
        }
    }

    #showSearchList()
    {
        const config = {};
        config.title = "품목 찾기"
        config.field = "product"
        config.name = "product"
        config.columnData = "name"
        config.columnTitle = "이름"

        const searchList = document.querySelector('search-list');
        const info = {
            collection : "product",
            columns :  [
                            { "data": "_id", "title":"id"},
                            { "data": "name", "title":"이름"}
                        ],
            title : "품목 찾기",
            formName : "",
            targetField : "product"
        }
        searchList.setData(info)
    }
  
    setData(data)
    {
    }

    #render()
    {
        const template = this.#getTemplate();
        this.appendChild(template.content.cloneNode(true));
        if(this.data.editable) this.querySelector('.command-show-search-list').classList.remove('hidden')
        this.#setProductList();    
        
    }

    #setProductList()
    {
        if(this.data.product.length === 0){
            this.#setProductInField();
            return;
        };
        
        this.data.product.forEach(product => {
            if(!product || !product.id) return;
            const product_info = store.getInfo('product', '_id', product.id);
            product._id = product.id;
            if(product_info) this.#addProductButton(product, product_info.name)
        });
        this.#setProductInField();

    }

    #hasProduct(id)
    {   
        return this.data.product.some(item => item['id'] === id);
    }

    #addProductButton(product, name)
    {
        const span = `
        <span class="badge rounded-pill ${this.#getProductType(product.code)}" id="product_${product._id}">${name}`
        
        const button = (this.data.editable)? `<button type="button" class="btn btn-icon btn-clean me-0 btn-xs command-remove-product" data-id="${product._id}">
        <i class="fa fa-times"></i></button></span>` : '</span>'
        this.querySelector('.product-group').innerHTML += span+button;
    }

    #getProductType(code)
    {
        if(code === ('제품')) return 'product';
        else if(code === ('원재료')) return 'material';
        else return 'item';
    }

    #addProductData(product)
    {
        this.data.product.push({id:product._id, code:product.code});
    }

    #setProductInField()
    {
        this.querySelector('input[name=product]').value = JSON.stringify(this.data.product);
    }

    #deleteProduct(id)
    {
        const _id = "product_"+id;
        const target = document.getElementById(_id);
        target.remove();
        this.#deleteProductData(id);
        this.#setProductInField();
    }

    #deleteProductData(id){
        const index = this.data.product.findIndex(item => item['id'] === id);
        if (index > -1) {
            this.data.product.splice(index, 1);
        }
        return this.data.product;
    }

    #getTemplate()
    {
        const inner_template = document.createElement('template');
        inner_template.innerHTML = `
        <style>
            .badge{
               padding: 4px 12px;
            }
            .badge.product{
                background-color: #007bff;
                color: white;
            }
            .badge.material{
                border-color: #ffc107 !important;
                background: #fce49d;
                color: black;
            }
            .badge.item{
                border-color: #31ce36 !important;
                background: #b4ffd3f2;
                color: black;
            }
        </style>
        <input type="hidden" name="product">
        <div class="row-space-between" >
            <label for="product" class="form-label">품목</label>
                <button type="button" class="btn btn-sm btn-icon btn-round btn-primary command-show-search-list hidden" id="product">
                    <i class="fas fa-plus"></i>
                </button>
        </div>
        <div class="product-group"></div>
        `;
        return inner_template;
    }

  }
  customElements.define('product-upload', ProductUpload);
  
  
  
  
  
   
  
  
  