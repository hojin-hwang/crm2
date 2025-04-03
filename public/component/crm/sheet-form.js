class SheetForm extends AbsForm
{
    constructor()
    {
        super();  
    }

    afterRender()
    {
        util.selectOption(this, '#sheet_status', this.data["status"]);
        util.selectOption(this, '#sheet_step', this.data["step"])
        if(!this.data["isNew"]) this.querySelector('.command-show-delete-button').classList.remove('hidden');
        if(!this.data["isNew"]) this.#setModalCondition();

        this.querySelector('.product-zone').appendChild(new ProductUpload(this.data.product, true))

        this.showDelete();
        this.showSave();

        if(this.data["isNew"])
        {
            const fileUpload = new FileUpload({isNew:true, _id:this.data._id})
            this.querySelector('.card.main .card-body').appendChild(fileUpload);
        }
        else
        {
            const fileUpload = new FileUpload(this.data)
            this.querySelector('.card.main .card-body').appendChild(fileUpload);
        }
          
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
            this.data["isNew"] = false;
        }
        else
        {
            const _data = {};
            _data["_id"] = util.generateObjectId();
            _data["name"] = "";
            _data["userName"] = globalThis.user.name;
            _data["userId"] = globalThis.user._id;
            _data["customer"] = "0000000000";
            _data["company"] = "0000000000";
            _data["product"] = []
            _data["customerName"] = "없음";
            _data["companyName"] = "없음";
            _data["productName"] = "";
            _data["step"] = "제안";
            _data["isNew"] = true;
            _data["issuedate"] = util.getDayDashFormat(new Date());
            _data["date"] = util.getDayDashFormat(new Date());
            _data["memo"] = "";
            Object.assign(this.data, _data);
        }

    }
    

    getTemplate()
    {
        const inner_template = document.createElement('template');
        inner_template.innerHTML = `
        <style>
            button i.fa-times{
                color: gray;
                font-weight: lighter;
            }
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
        <div class="sheet-form">
            <div class="card main">
                <div class="card-header form-header row-space-between">
                    <span class="fw-semibold">영업 기회</span>
                    <button type="button" class="btn btn-icon btn-black command-close-modal">
                    <i class="fas fa-times"></i></button>
                </div>
                <div class="card-body">
                    <div class="card">
                        <div class="card-body">
                        <form>
                            <input type="hidden" name="_id" value="${this.data._id}" >
                            <input type="hidden" name="customer"  value="${this.data.customerId}"> 
                            <input type="hidden" name="company"  value="${this.data.companyId}">
                            <input type="hidden" name="user"  value="${this.data.userId}">  
                            <div class="mb-3">
                                <label for="title" class="form-label">제목 *</label>
                                <input type="text" class="form-control" id="title" name="name" value="${this.data.name}">
                                <div class="form-text">필수 입력 사항입니다.</div>
                            </div>

                            <div class="mb-3 row-space-between">
                                <div>
                                    <label for="customer" class="form-label">고객</label>
                                    <input type="text" readonly class="form-control command-show-search-list" id="customer" name="customerName"  value="${this.data.customerName}">
                                    <div class="form-text company-name">고객을 선택해주세요</div>
                                </div>
                                <div>
                                    <label for="company" class="form-label">고객사</label>
                                    <input type="text" readonly class="form-control" id="company" name="companyName"  value="${this.data.companyName}">
                                </div>
                            </div>


                            <div class="mb-3  row-space-between">
                                <div>
                                    <label for="issuedate" class="form-label">날짜</label>
                                    <input type="date" class="form-control" id="issuedate" name="issuedate"  value="${this.data.issuedate}">
                                </div>
                                <div>
                                    <label for="sheet_step" class="form-label">단계</label>
                                    <select name="step" id="sheet_step" class="form-select">
                                        <option value="제안">제안</option>
                                        <option value="샘플/견적">샘플/견적</option>
                                        <option value="채택">채택</option>
                                        <option value="보류(drop)">보류(drop)</option>
                                    </select>
                                </div> 
                            </div>

                            <div class="mb-3 row-space-between">
                                <div>
                                    <label for="user" class="form-label">담당자</label>
                                    <input type="text" readonly class="form-control command-show-search-list" id="user" name="userName"  value="${this.data.userName}">
                                    <div class="form-text company-name">담당자를 선택해주세요</div>
                                </div>  

                            </div>
                            <div class="mb-3 product-zone">

                            </div>

                            <div class="mb-3">
                                <label for="memo" class="form-label">Memo</label>
                                <textarea rows="2" class="form-control" id="memo" name="memo" >${this.data.memo}</textarea> 
                            </div>
                        </form>
                        </div>
                    </div>
                    
                    <div class="mt-1 row-space-between command-group">
                        <div>
                            <button type="button" class="btn btn-link m-1 command-show-delete-button hidden">영업기회 삭제</button>
                            <button type="button" class="btn btn-outline-dark m-1 command-delete-form hidden" data-value="${this.data._id}">삭제하시겠습니까? </button>
                        </div>
                        <button type="button" class="btn btn-primary command-save-form">save</button> 
                    </div>
                </div>
                <hr>
                </div>
            </div>
        </div>
        `;
        return inner_template;
    }

  }
  customElements.define('sheet-form', SheetForm);
  
  
  
  
  
   
  
  
  