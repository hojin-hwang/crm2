class SheetView extends AbsForm
{
    constructor()
    {
        super();  
        this.addEventListener('click', this.#handleClick);
    }

    #handleClick(e) {
        e.composedPath().find((node) => 
        {
            if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
            if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
            
            if(node.className.match(/command-show-memo/))
            {
                this.#handleToggleClass('.memo-pannel');
                return;
            } 
            if(node.className.match(/command-save-memo/))
            {
                this.#saveMemo(node);
                return;
            } 
            if(node.className.match(/command-show-delete-memo/))
            {
                const _pNode = node.closest('memo');
                _pNode.querySelector('.command-delete-memo').classList.remove('hidden')
                return;
            }
            if(node.className.match(/command-delete-memo/))
            {
                this.#deleteMemo(node);
                return;
            } 
            if(node.className.match(/command-new-work-form/))
            {
                const messageData = {};
                messageData.tagName = 'work-form';
                messageData.info = this.data;
                const _message = {msg:"DO_SHOW_MODAL", data:messageData}
                window.postMessage(_message, location.href);

                this.sendPostMessage({msg:"SELECT_TABLE_MENU", data:"work"});
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
                case "GET_SALES_WORK_LIST":
                    this.work_list = (event.data.data)? event.data.data.list : [];
                    this.#appendWorkList();
                break;
                case "ADD_SHEET_WORK_MEMO":
                    this.#appendMemo(event.data.data)
                break;
                case "GET_SALES_MEMO_LIST":
                    this.memo_list = (event.data.data)? event.data.data.list : [];
                    this.#appendMemoList();
                break;
                
                default:
                break;
            }
        }
    }

    render()
    {
        const template = this.#getTemplate();
        this.appendChild(template.content.cloneNode(true));
        if(this.data["_id"]) this.#setModalCondition();
        if(!this.data["memo"]) this.querySelector('.command-show-memo').classList.add('hidden')
        this.querySelector('.product-zone').appendChild(new ProductUpload(this.data.product, false))
        //this.#getProductList();
        const formData = new FormData();
        formData.append("sheet", this.data["_id"]);
        //store.getSheetSalesWorkList(this.data["_id"]);
        //store.getSheetSalesMemoList(this.data["_id"]);
        //store.getDataList(formData, "memo", "GET_SALES_MEMO_LIST")
        store.getDataList("work",false, "GET_SALES_WORK_LIST", formData)
        store.getDataList("memo",false, "GET_SALES_MEMO_LIST", formData)
    }
    
    #handleToggleClass(className)
    {
        const targetElement = this.querySelector(className);
        targetElement.classList.toggle('hidden');
    }

    #setModalCondition()
    {
        document.querySelector('.modal-body').classList.add('sales-sheet-modal')
    }

    setData(data)
    {
        if(data)
        {
            Object.assign(this.data, store.getInfo('sheet','_id', data._id));
        }
        
    }
    
    #getProductList()
    {
        this.data.product.forEach(product => {
            const product_info = store.getInfo('product', '_id', product.id);
            if(product_info) this.#addProduct(product_info.name, product.type)
        });
    }

    #addProduct(name, type)
    {
        const span = `
	        <label class="selectgroup-item"><span class="selectgroup-button ${type}">${name}</span></label>`;
        this.querySelector('.product-group').innerHTML += span;
    }


    #appendWorkList()
    {
        let card = '';
        this.work_list.forEach(work=>{
            card += `<div class="card">
                <div class="card-header row-space-between ${this.#getWorkCardBackgroundColor(work.status)}">
                <span>${work.customerName} /  ${work.userName}</span>
                <span>${work.status} /${work.duedate}</span>
                </div>
                <div class="card-body">
                    <h6>${work.name}</h6>
                    ${this.#getMemo(work.memo)}
                    ${this.#getRemark(work.remark)}
                </div>
            </div>`
        })
        this.querySelector('.sales-work-list').innerHTML = card;
    }

    #appendMemoList()
    {
        this.memo_list.forEach(memo=>{
            this.#appendMemo({info:memo})
        }); 
    }

    #getWorkCardBackgroundColor(status)
    {
        if(status === '고객지원') return 'sales-support';
        else if (status === '계약' || status === '매출') return 'sales-contract';
        else return 'sales-intro';
    }
    
    #getMemo(memo)
    {
        return (memo)? `<hr><div class="mb-3"><pre>${memo}</pre></div>` : '';
        
    }

    #getRemark(remark)
    {
        return (remark)? `<hr><div class="mb-3"><label  class="form-label">Remark</label><pre>${remark}</pre></div>` : '';
    }
    
    #saveMemo(node)
    {
        const formData = new FormData(node.closest('form'));
        formData.append("sheet",this.data._id);
        store.addInfo(formData, "memo", "ADD_SHEET_WORK_MEMO")
        this.querySelector('textarea[name=memo]').value = '';
        return;
    }

    #appendMemo(data)
    {
        const _group = this.querySelector('.sales-sheet-memo-group');
        const _newMemo = this.#makeNewMemo(data.info);
        _group.prepend(_newMemo);
    }

    #deleteMemo(node)
    {
        const formData = new FormData();
        formData.append("_id",node.dataset.id);
        formData.append("sheet",this.data._id);
        //store.removeSheetWorkMemo(formData);
        store.deleteInfo(formData, "memo", "DELETE_SHEET_WORK_MEMO")
        const _card = node.closest('memo');
        _card.remove();
    }

    #makeNewMemo(data)
    {
        const memo = document.createElement('memo');
        memo.innerHTML = `<div class="card">
                                <div class="card-header row-space-between btn-info-soft">
                                    <span>${data.userName}</span>
                                    <span>${data.date}</span>
                                </div>
                                <div class="card-body">
                                    <p>${data.memo}</p>
                                </div>
                                <div class="card-tail">
                                    ${this.#deleteButton(data)}
                                </div>
                            </div>`
        return memo;
    }

    #deleteButton(data)
    {
        if(globalThis.user.degree === '관리자' || data.userId === globalThis.user._id)
        {
            return `<button type="button" class="btn btn-outline-dark m-1 command-delete-memo hidden" data-id="${data._id}">삭제하시겠습니까?</button>
            <a href="#" class="card-link command-show-delete-memo" >삭제</a>`
        }
        return ''
    }

    #getTemplate()
    {
        const inner_template = document.createElement('template');
        inner_template.innerHTML = `
        <style>
            @media screen and (max-width: 767px) {
                .sheet-view {
                    flex-direction: column;
                }
            }
            pre{
            white-space: pre-wrap;
            font-size: unset;
            font-family: unset;
            }
            .modal-body{
                width: 1200px;
            }
            .sheet-view{
                display: flex;
                gap: 12px;
            }
            .sheet-view > .card{width: 100%;}
            .card-body.container{
                height:85vh;
                overflow: auto;
            }
            .sheet-memo-list {
                min-width: 360px;
                height: 70vh;
                overflow: auto;
            }
            .selectgroup-button{color:black; border-radius: 50px !important;}
            .selectgroup-button.product{
                background-color: #007bff;
                color: white;
            }
            .selectgroup-button.material{
                border-color: #ffc107 !important;
                background: #fce49d;
                color: black;
            }
            .selectgroup-button.item{
                border-color: #31ce36 !important;
                background: #b4ffd3f2;
                color: black;
            }
            .card-tail {
                padding: 5px 20px;
                text-align: right;
            }
            hr{
                opacity: 0.1;
            }
            .sales-intro {
                background-color: #dfe7ff!important;
            }
            .sales-support {
                background-color: #13DEB9!important;
                color: white;
            }
            .sales-contract {
                background-color: #FA896B!important;
                color: white;
            }
            .btn-info-soft{
                background: aliceblue!important;
            }
        </style>
        <div class="sheet-form sheet-view">
            <div class="card">
                <div class="card-header  form-header row-space-between">
                    <div>
                        <span class="fw-semibold mr-3">${this.data.name}</span>
                        <button type="button" class="btn btn-success btn-xs command-show-memo">memo</button> 
                    </div>    
                    <button type="button" class="btn btn-icon btn-black command-close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="card-body">
                    <div class="card">
                        <div class="card-body container">
                            <div class="mb-3 memo-pannel hidden">
                                <label for="memo" class="form-label">Memo</label>
                                <textarea rows="5" readonly class="form-control">${this.data.memo}</textarea> 
                            </div>
                            <div class="mb-3 product-zone">
                                <!--<label for="products" class="form-label">품목</label>
                                <div class="product-group"></div>-->
                            </div>

                            <div class="mb-3 row-space-between">
                                <label for="sales_work" class="form-label">영업 내용</label>
                                <button type="button" class="btn btn-primary command-new-work-form">영업일지 등록</button>
                            </div>
                            <div class="sales-work-list">
                            </div>
                            <hr>
                            <file-image editable="false" contentsid="${this.data.id}" new="false"></file-image>
                            <file-etc editable="false" contentsid="${this.data.id}" new="false"></file-etc>
                        </div>
                    </div>
                </div>
                
            </div>

            <div class="sheet-memo-list">
                <div class="card w-100">
                    <div class="card-header" style="padding-top: 12px;padding-bottom: 12px">
                        <h5 class="card-title fw-semibold">의견</h5>
                    </div>
                    <div class="card-body p-4">
                        <form>
                        <input type="hidden" name="user" value="${globalThis.user._id}">
                        <input type="hidden" name="userName" value="${globalThis.user.name}">
                        <div class="card">
                                <div class="card-header row-space-between btn-info">
                                    <span>${globalThis.user.name}</span>
                                    <span>${util.getDayDashFormat(new Date())}</span>
                                </div>
                                <div class="card-body">
                                    <textarea rows="2" class="form-control" id="memo" name="memo" ></textarea>
                                </div>
                                <div class="card-tail">
                                    <button type="button" class="btn btn-border btn-info btn-sm command-save-memo">등록</button> 
                                </div>
                            </div>
                        </form>
                        <div class="sales-sheet-memo-group">
                        </div>   
                    </div>
                    </div>
                </div>
            </div>
        </div>
        `;
        return inner_template;
    }

  }
  customElements.define('sheet-view', SheetView);
  
  
  
  
  
   
  
  
  