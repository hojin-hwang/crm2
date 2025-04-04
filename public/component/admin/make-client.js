class MakeClient extends AbstractComponent
{
  constructor()
  {
    super();
    this.messageListener = this.onMessage.bind(this)
    window.addEventListener("message", this.messageListener);

    this.addEventListener('click', this.handleClick);
    this.userInfo = {};
    this.boardInfoList = [];
    this.info = {};
  }

  static get observedAttributes(){return [];}

  handleClick(e) {
    //e.preventDefault();
    e.composedPath().find((node)=>{
      if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
      if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
      if(node.className.match(/command-create-client/))
        {
            const form = node.closest('form');
            const formData = new FormData(form);
            const result = this.addInfo(formData, 'client', "COMMAND-")
            result.then((response) => {
              if(response.code === 100)
              { 
                //Button Abled Super Admin User
                this.info.clientId = response.data.clientId;
                this.enableButton(document.getElementById('user_table'));
              }
              else
              {
                alert(response.message);
              }
            });
            return;
        }
        if(node.className.match(/command-create-user/))
        {
          const form = this.querySelector('form');
          this.info.email = form.email.value;
          const result = this.makeUserTable()
            return;
        }
        if(node.className.match(/command-create-company/))
        {
            const result = this.makeCompanyTable()
            return;
        } 
        if(node.className.match(/command-create-customer/))
        {
            const result = this.makeCustomerTable()
            return;
        }
        if(node.className.match(/command-create-product/))
        {
            const result = this.makeProductTable()
            return;
        }
        if(node.className.match(/command-create-sheet/))
        {
            const result = this.makeSheetTable()
            return;
        }
        if(node.className.match(/command-create-work/))
        {
            const result = this.makeWorkTable()
            return;
        }
        if(node.className.match(/command-create-notice/))
        {
            const result = this.makeNoticeTable()
            return;
        }
        if(node.className.match(/command-create-boardInfo/))
        {
            const result = this.makeBoardInfoTable()
            return;
        }

    });
  }

  onMessage(event)
  {
    const window_url = window.location.hostname;
    if(event.origin.indexOf(window_url) < 0) return;
    if(event.data.msg)
    {
        switch(event.data.msg)
        {
          
        }
    }
  }

  connectedCallback()
  {
    this.render();
  }

  disconnectedCallback()
  {
    window.removeEventListener("message", this.messageListener);
    this.removeEventListener('click', this.handleClick);
  }

  render()
  {
    const template = this.#getTemplate();
    if(template) this.appendChild(template.content.cloneNode(true));
    return;
  }

  setData(info){
    if(info)
    {
      Object.assign(this.info, info)
      console.log(this.info)
    }
    else
    {
      this.info.clientId = "";
      this.info.name = "";
      this.info.email = "";
      this.info.tel = "";
      this.info.site = "";
    }
  }

  async #deleteApply()
  {
    if(!this.info._id) return;  
    try{
          const formData = new FormData();
          formData.append("_id", this.info._id)
          const response = await util.sendFormData(`/apply/delete`, "POST", formData);
          if(response.code === 100)
          {

              const message2 =  {msg:"COMMAND_CHANGE_DATA", data:response.data.info} 
              window.postMessage(message2, location.href);
          }
          else
          {
              console.log(response.message);
          }
      }
      catch (error) {
          console.error('오류:', error);
          alert('실패했습니다.');
      }
      return;
  }

  makeUserTable = async () => {
    const formData = new FormData();
    formData.append('model', 'User');
    formData.append('username', `admin__${this.info.clientId}`);
    formData.append('email', this.info.email);
    formData.append('name', '관리자');
    formData.append('degree', '관리자')
    formData.append('department', '기타')
    formData.append('position', '사원')
    formData.append('clientId', this.info.clientId)
    const result = this.addDoc(formData, "COMMAND-");
    result.then((response) => {
      if(response.code === 100)
      { 
        Object.assign(this.userInfo, response.data.info);
        this.enableButton(document.getElementById('company_table'));
      }
    });
    
  }

  makeCompanyTable = async () => {
    const formData = new FormData();
    formData.append('model', 'Company');
    formData.append('name', 'Sample Company');
    formData.append('user', this.userInfo._id);
    formData.append('address', '가산시 가상동 123-456');
    formData.append('memo', 'Sample Company Memo')
    formData.append('tel', '02-1234-5678')
    formData.append('fax', '02-1234-9999')
    formData.append('clientId', this.info.clientId)
    const result = this.addDoc(formData, "COMMAND-");
    result.then((response) => {
      if(response.code === 100)
      { 
        this.companyInfo = {};
        Object.assign(this.companyInfo, response.data.info);
        this.enableButton(document.getElementById('customer_table'));
      }
    });
    
  }
    
  makeCustomerTable = async () => {
    const formData = new FormData();
    formData.append('model', 'Customer');
    formData.append('name', '홍길동');
    formData.append('user', this.userInfo._id);
    formData.append('address', '가산시 가상동 123-456 2층');
    formData.append('memo', 'Sample Customer Memo')
    formData.append('position', 'Manager')
    formData.append('email', 'hong@test.com')
    formData.append('tel', '02-1234-5678')
    formData.append('hp', '010-1234-9999')
    formData.append('clientId', this.info.clientId)
    formData.append('company', this.companyInfo._id)
    const result = this.addDoc(formData, "COMMAND-");
    result.then((response) => {
      if(response.code === 100)
      { 
        this.customerInfo = {};
        Object.assign(this.customerInfo, response.data.info);
        this.enableButton(document.getElementById('product_table'));
      }
    });
    
  }

  makeProductTable = async () => {
    const formData = new FormData();
    formData.append('model', 'Product');
    formData.append('name', '아이템 A212-3(샘플)');
    formData.append('code', '제품')
    formData.append('brand', '자체생산')
    formData.append('memo', '2025년까지 판매 예정')
    formData.append('clientId', this.info.clientId)
    const result = this.addDoc(formData, "COMMAND-");
    result.then((response) => {
      if(response.code === 100)
      { 
        this.productInfo = {};
        Object.assign(this.productInfo, response.data.info);
        this.enableButton(document.getElementById('sheet_table'));
      }
    });
    
  }

  makeSheetTable = async () => {

    const product = this.productInfo;
    const productInfo = {
      id: product._id,
      code: product.code,
    }
    const formData = new FormData();
    formData.append('model', 'Sheet');
    formData.append('name', '글로벌 컴퍼니 영업기회(샘플)');
    formData.append('memo', 'Sample 영업기회 Memo')
    formData.append('product', JSON.stringify(productInfo))
    formData.append('step', '제안')
    formData.append('clientId', this.info.clientId)
    formData.append('company', this.companyInfo._id)
    formData.append('user', this.userInfo._id);
    formData.append('customer', this.customerInfo._id);
    const result = this.addDoc(formData, "COMMAND-");
    result.then((response) => {
      if(response.code === 100)
      { 
        this.sheetInfo = {};
        Object.assign(this.sheetInfo, response.data.info);
        this.enableButton(document.getElementById('work_table'));
      }
    });
  }

  makeWorkTable = async () => {
    const formData = new FormData();
    formData.append('model', 'Work');
    formData.append('name', '담당자 첫미팅(샘플)');
    formData.append('memo', 'Sample 영업일지 Memo')
    formData.append('remark', 'Sample 영업일지 고려사항')
    formData.append('status', '타겟제품정보')
    formData.append('sheet', this.sheetInfo._id)
    formData.append('clientId', this.info.clientId)
    formData.append('company', this.companyInfo._id)
    formData.append('user', this.userInfo._id);
    formData.append('customer', this.customerInfo._id);
    const result = this.addDoc(formData, "COMMAND-");
    result.then((response) => {
      if(response.code === 100)
      { 
        this.workInfo = {};
        Object.assign(this.workInfo, response.data.info);
        this.enableButton(document.getElementById('boardInfo_table'));
      }
    });
  }


  makeBoardInfoTable = async () => {
    const tableList = [
      {
        name:"고객사",
        type:"default",
        tag:"company",
      },
      {
        name:"고객",
        type:"default",
        tag:"customer",
      },
      {
        name:"품목",
        type:"default",
        tag:"product",
      },
      {
        name:"캘린더",
        type:"default",
        tag:"calendar",
      },
      {
        name:"영업기회",
        type:"default",
        tag:"sheet",
      },
      {
        name:"영업일지",
        type:"default",
        tag:"work",
      },
      {
        name:"공지사항",
        type:"custom",
        tag:"notice",
      }
    ];
    tableList.forEach((table) => {
      const formData = new FormData();
      formData.append('model', 'BoardInfo');
      formData.append('name', table.name);
      formData.append('type', table.type)
      formData.append('tag', table.tag)
      formData.append('clientId', this.info.clientId)
      formData.append('user', this.userInfo._id);
      const result = this.addDoc(formData, "COMMAND-");
      result.then((response) => {
        if(response.code === 100)
        { 
          this.boardInfo = {};
          this.boardInfoList.push(response.data.info);
        }
      });
    });
    this.enableButton(document.getElementById('notice_table'));
  }

  makeNoticeTable = async () => {
    let boardInfo = this.boardInfoList.find((info) => info.tag === 'notice');
    const formData = new FormData();
    formData.append('model', 'Board');
    formData.append('title', 'SS CRM 공지사항');
    formData.append('contents', 'SS CRM 공지사항 내용')
    formData.append('boardId', boardInfo._id)
    formData.append('clientId', this.info.clientId)
    formData.append('user', this.userInfo._id);
    const result = this.addDoc(formData, "COMMAND-");
    result.then((response) => {
      if(response.code === 100)
      { 
        this.querySelectorAll('.make-table').forEach((table) => {
          table.querySelectorAll('button').forEach((button) => {
            this.disableButton(button);
          });
        });
      }
    });
  }

  disableButton = (button) => {
    button.setAttribute('disabled','disabled');
  }

  enableButton = (button) => {
    button.removeAttribute('disabled');
  }  
    
  async addInfo(formData, collection, command)
	{
		try{
			return await util.sendFormData(`/${collection}/add`, "POST", formData);
		}
		catch (error) {
            console.error('오류:', error);
            alert('실패했습니다.');
        }
		return;
	}

  async addDoc(formData, command)
	{
		try{
			return await util.sendFormData(`/client/addDoc`, "POST", formData);
		}
		catch (error) {
            console.error('오류:', error);
            alert('실패했습니다.');
        }
		return;
	}

  #getTemplate()
  {
      const tempalate = document.createElement('template');
      tempalate.innerHTML = `
        <style>
        .make-client{
          width: 600px;
        }
        .make-table{
          display: flex;
          flex-direction: column;
          gap:12px;
        }
        .form-group{
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      </style>
      <section class="make-client">
        <div class="card">
          <div class="card-header form-header row-space-between">
            <span class="fw-semibold">Make Client</span>
            <button type="button" class="btn btn-icon btn-black command-close-modal">
                    <i class="fas fa-times"></i></button>
          </div>
          <div class="card-body">
            <form>
              <div class="form-group">
                <label for="clientId">Client Id</label>
                <input type="text" id="clientId" value="${this.info.clientId}" name="clientId" placeholder="client name" class="form-control" style="width: auto;">
              </div>
              <div class="row-space-between">
                <div class="form-group">
                  <label for="clientId">name</label>
                  <input type="text" id="name" value="${this.info.name}" name="name" class="form-control" style="width: auto;">
                </div>
                <div class="form-group">
                  <label for="email">email</label>
                  <input type="text" id="email" value="${this.info.email}" name="email" class="form-control" style="width: auto;">
                </div>
              </div>
              <div class="row-space-between">
                <div class="form-group">
                  <label for="site" class="hidden">site</label>
                  <input type="hidden" id="site" value="${this.info.site}" name="site" class="form-control" style="width: auto;">
                </div>
                <div class="form-group">
                  <label for="tel">tel</label>
                  <input type="text" id="tel" value="${this.info.tel}" name="tel" class="form-control" style="width: auto;">
                </div>
                <div class="form-group">
                  <label for="authCode">authCode</label>
                  <input type="text" id="authCode" value="${this.info.authCode}" name="authCode" class="form-control" style="width: auto;">
                </div>
              </div>
              <button type="button" class="btn btn-primary form-control command-create-client">Make Client</button>
            </form>
            <hr>
            <div class="make-table">
              <div class="form-group">
                <label for="user_table">Make User Table</label>
                <button type="button" class="btn btn-primary command-create-user" id="user_table" disabled="disabled">User Table</button>
              </div>
              <div class="form-group">
                <label for="company_table">Make Company Table</label>
                <button type="button" class="btn btn-black command-create-company" id="company_table" disabled="disabled">Company Table</button>
              </div>
              <div class="form-group">
                <label for="customer_table">Make Customer Table</label>
                <button type="button" class="btn btn-black command-create-customer" id="customer_table" disabled="disabled">Customer Table</button>
              </div>
              <div class="form-group">
                <label for="product_table">Make Product Table</label>
                <button type="button" class="btn btn-black command-create-product" id="product_table" disabled="disabled">Product Table</button>
              </div>
              <div class="form-group">
                <label for="sheet_table">Make Sheet Table</label>
                <button type="button" class="btn btn-black command-create-sheet" id="sheet_table" disabled="disabled">Sheet Table</button>
              </div>
              <div class="form-group">
                <label for="work_table">Make Work Table</label>
                <button type="button" class="btn btn-black command-create-work" id="work_table" disabled="disabled">Work Table</button>
              </div>

              <div class="form-group">
                <label for="boardInfo_table">Make BoardInfo Table</label>
                <button type="button" class="btn btn-black command-create-boardInfo" id="boardInfo_table" disabled="disabled">BoardInfo Table</button>
              </div>

              <div class="form-group">
                <label for="notice_table">Make Notice Table</label>
                <button type="button" class="btn btn-black command-create-notice" id="notice_table" disabled="disabled">Notice Table</button>
              </div>

            </div>

          </div>
        </div>
      </section>
      `;  
      return tempalate;
  }
}
customElements.define("make-client", MakeClient);

