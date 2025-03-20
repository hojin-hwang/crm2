class WorkForm extends AbsForm
{
    constructor()
    {
        super();  
    }


    afterRender()
    {
        util.selectOption(this, '#sales_status', this.data["status"]);
        if(!this.data["isNew"]) this.querySelector('.command-show-delete-button').classList.remove('hidden');
        else this.querySelector('.meta-data').classList.add('hidden');

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
    
    setData(data)
    {
        if(data?.collection === 'sheet-view')
        {
            const _data = {};
            _data["id"] = util.generateObjectId();
            _data["name"] = "";
            _data["user"] = globalThis.user._id;
            _data["userName"] = globalThis.user.name;
            _data["customerId"] = data.customer._id;
            _data["companyId"] = data.company._id;
            _data["sheetId"] = data._id;
            _data["customerName"] = data.customer.name;
            _data["companyName"] = data.company.name;
            _data["sheetName"] = data.name;
            _data["status"] = "경쟁사 정보";
            _data["isNew"] = true;
            _data["duedate"] = (data && data.duedate)? data.duedate:util.getDayDashFormat(new Date());
            _data["date"] = util.getDayDashFormat(new Date());
            _data["memo"] = "";
            _data["remark"] = "";
            Object.assign(this.data, _data);
        }
        else if(data)
        {
            Object.assign(this.data, data);
            this.data["isNew"] = false;
        }
        else
        {
            const _data = {};
            _data["_id"] = util.generateObjectId();
            _data["name"] = "";
            _data["userId"] = globalThis.user._id;
            _data["userName"] = globalThis.user.name;
            _data["customer"] = "";
            _data["company"] = "";
            _data["sheet"] = "";
            _data["customerName"] = "";
            _data["companyName"] = "";
            _data["sheetName"] = "";
            _data["status"] = "경쟁사 정보";
            _data["isNew"] = true;
            _data["duedate"] = (data && data.duedate)? data.duedate:util.getDayDashFormat(new Date());
            _data["date"] = util.getDayDashFormat(new Date());
            _data["memo"] = "";
            _data["remark"] = "";
            Object.assign(this.data, _data);
        }
    }
    

    getTemplate()
    {
        const inner_template = document.createElement('template');
        inner_template.innerHTML = `
        <style>
            hr{opacity: 0.1;}
        </style>
        <div class="card main">
            <div class="card-header form-header row-space-between">
                <span class="fw-semibold">영업 일지</span>
                <button type="button" class="btn btn-icon btn-black command-close-modal">
                <i class="fas fa-times"></i></button>
            </div>
            <div class="card-body">
                <div class="card">
                    <div class="card-body">
                    <form>
                        <input type="hidden" value="${this.data._id}" name="_id">
                        <input type="hidden" value="${this.data.userId}" name="user">
                        <input type="hidden" value="${this.data.companyId}" name="company">
                        <input type="hidden" value="${this.data.customerId}" name="customer">
                        <input type="hidden" value="${this.data.sheetId}" name="sheet">
                        <div class="mb-3">
                            <label for="title" class="form-label">제목 *</label>
                            <input type="text" class="form-control" id="title" name="name" value="${this.data.name}">
                            <div class="form-text">필수 입력 사항입니다.</div>
                        </div>

                        <div class="mb-3 row-space-between">
                            <div>
                                <label for="user" class="form-label">담당자</label>
                                <input type="text" readonly class="form-control command-show-search-list" id="user" name="userName"  value="${this.data.userName}">
                                <div class="form-text company-name">담당자를 선택해주세요</div>
                            </div>  
                            <div>
                                <label for="user" class="form-label">영업기회 *</label>
                                <input type="text" readonly class="form-control command-show-search-list" id="sheet" name="sheetName"  value="${this.data.sheetName}">
                                <div class="form-text company-name">영업기회를 선택해주세요</div>
                            </div>
                        </div>

                        <div class="mb-3 row-space-between">
                            <div>
                                <label for="customer" class="form-label">고객</label>
                                <input type="text" readonly class="form-control command-show-search-list" id="customer" name="customerName"  value="${this.data.customerName}">
                                <div class="form-text company-name">고객을 선택해주세요</div>
                            </div>
                             <div>
                                <label for="company" class="form-label">고객사</label>
                                <input type="text" readonly class="form-control " id="company" name="companyName"  value="${this.data.companyName}">
                            </div>
                        </div>

                        <div class="mb-3  row-space-between">
                            <div>
                                <label for="duedate" class="form-label">날짜</label>
                                <input type="date" class="form-control" id="duedate" name="duedate"  value="${this.data.duedate}">
                            </div>
                            <div>
                                <label for="sales_status" class="form-label">유형</label>
                                <select name="status" id="sales_status" class="form-select">
                                    <option value="경쟁사정보">경쟁사정보</option>
                                    <option value="고객사소식">고객사소식</option>
                                    <option value="업계현황">업계현황</option>
                                    <option value="타겟제품정보">타겟제품정보</option>
                                    <option value="샘플택배">샘플택배</option>
                                    <option value="샘플택배(완료)">샘플택배(완료)</option>
                                    <option value="샘플제작요청">샘플제작요청</option>
                                    <option value="자료요청">자료요청</option>
                                    <option value="원료선택이유">원료선택이유</option>
                                </select>
                            </div> 
                        </div>

                        <div class="mb-3 hidden">
                            <button type="button" class="btn btn-link p-0 command-show-meta-data">데이터 보기</button>
                            <div class="meta-data-info hidden" id="metadata"  ></div> 
                        </div>

                        <div class="accordion meta-data mb-3" id="accordionExample" >
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingOne">
                                    <button class="accordion-button collapsed command-show-meta-data" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                                    데이터 더보기
                                    </button>
                                </h2>
                                <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionExample" style="">
                                    <div class="accordion-body">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="memo" class="form-label">Memo</label>
                            <textarea rows="2" class="form-control" id="memo" name="memo" >${this.data.memo}</textarea> 
                        </div>

                        <div class="mb-3">
                            <label for="remark" class="form-label">비고</label>
                            <textarea rows="2" class="form-control" id="remark" name="remark" >${this.data.remark}</textarea> 
                        </div>
                    </form>
                    </div>
                </div>

                <div class="mt-1 row-space-between ">
                    <div class="command-group">
                        <button type="button" class="btn btn-link m-1 command-show-delete-button hidden">영업일지 삭제</button>
                        <button type="button" class="btn btn-outline-dark m-1 command-delete-form hidden" data-value="${this.data._id}">삭제하시겠습니까?</button>
                    </div>
                    <button type="button" class="btn btn-primary command-save-form">save</button> 
                </div>
                
                <hr>
            </div>
            

        </div>
        `;
        return inner_template;
    }

  }
  customElements.define('work-form', WorkForm);
  
  
  
  
  
   
  
  
  