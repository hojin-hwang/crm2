
class UseRecord extends AbstractComponent
{
  constructor()
  {
    super();
    this.AMOUNT_LIMIT = (globalThis.user.clientInfo.price === 'basic')? { ...globalThis.user.recordConfig,
      company: 200,
      customer: 400,
      boardInfo:10,
      price:'basic',
      } : {
        "sheet": "무제한",
        "work": "무제한",
        "product": "무제한",
        "board": "무제한",
        "file": "무제한",
        "company": "무제한",
        "customer": "무제한",
        "boardInfo": "무제한",
        "price":'professional',
    };
  }

  static get observedAttributes(){return [];}


  connectedCallback()
  {
    this.render();
  }

  render()
  {
    const template = this.#getTemplate();
    if(template) this.appendChild(template.content.cloneNode(true));
    
    this.#appendCompany()
    this.#appendCustomer()
    this.#appendSheet();
    this.#appendWork();
    this.#appendProduct();
    this.#appendBoardInfo();
    this.#appendBoardFile();
    return;
  }

  #appendCompany()
  {
    const data = {
      title: "고객사",
      subTitle: "CRM에 등록된 고객사",
      amount: globalThis.companyList.length,
      color: "bg-success",
      percent: (this.AMOUNT_LIMIT.price === 'professional')? 1:parseInt((globalThis.companyList.length / this.AMOUNT_LIMIT.company) * 100),
      ment: "Limit: " + this.AMOUNT_LIMIT.company
    };
    const card = this.#makeCard(data);
    this.querySelector('.row.record-body').appendChild(card);
  }

  #appendCustomer()
  {
    const data = {
      title: "고객",
      subTitle: "CRM에 등록된 고객",
      amount: globalThis.sheetList.length,
      color: "bg-danger",
      percent: (this.AMOUNT_LIMIT.price === 'professional')? 1:parseInt((globalThis.customerList.length / this.AMOUNT_LIMIT.customer) * 100),
      ment: "Limit: " + this.AMOUNT_LIMIT.customer
    };
    const card = this.#makeCard(data);
    this.querySelector('.row.record-body').appendChild(card);
  }

  #appendSheet()
  {
    const data = {
      title: "영업기회",
      subTitle: "CRM에 등록된 영업기회",
      amount: globalThis.sheetList.length,
      color: "bg-secondary",
      percent: (this.AMOUNT_LIMIT.price === 'professional')? 1:parseInt((globalThis.sheetList.length / this.AMOUNT_LIMIT.sheet) * 100),
      ment: "Limit: " + this.AMOUNT_LIMIT.sheet
    };
    const card = this.#makeCard(data);
    this.querySelector('.row.record-body').appendChild(card);
  }

  #appendWork()
  {
    const data = {
      title: "영업일지",
      subTitle: "CRM에 등록된 영업일지",
      amount: globalThis.workList.length,
      color: "bg-warning",
      percent: (this.AMOUNT_LIMIT.price === 'professional')? 1:parseInt((globalThis.workList.length / this.AMOUNT_LIMIT.work) * 100),
      ment: "Limit: " + this.AMOUNT_LIMIT.work
    };
    const card = this.#makeCard(data);
    this.querySelector('.row.record-body').appendChild(card);
  }
  
  #appendProduct()
  {
    const data = {
      title: "제품",
      subTitle: "CRM에 등록된 원재료, 제품, 상품",
      amount: globalThis.productList.length,
      color: "bg-info",
      percent: (this.AMOUNT_LIMIT.price === 'professional')? 1:parseInt((globalThis.productList.length / this.AMOUNT_LIMIT.product) * 100),
      ment: "Limit: " + this.AMOUNT_LIMIT.product
    };
    const card = this.#makeCard(data);
    this.querySelector('.row.record-body').appendChild(card);
  }

  #appendBoardInfo()
  {
    const _count = globalThis.boardInfoList.length - 6
    const data = {
      title: "게시판",
      subTitle: "CRM에 등록된 게시판",
      amount: _count,
      color: "bg-success",
      percent: (this.AMOUNT_LIMIT.price === 'professional')? 1:parseInt((_count / this.AMOUNT_LIMIT.boardInfo) * 100),
      ment: "Limit: " + this.AMOUNT_LIMIT.boardInfo
    };
    const card = this.#makeCard(data);
    this.querySelector('.row.record-body').appendChild(card);
  }

  async #appendBoardFile()
  {
    try {
      const formData = new FormData();
      formData.append('clientId', globalThis.user.clientId)
      const response = await util.sendFormData("/client/info", "POST", formData);
      if (response.code === 100)
      {
        const data = {
          title: "게시물",
          subTitle: "CRM에 등록된 게시물",
          amount: response.data.limit.board,
          color: "bg-secondary",
          percent: (this.AMOUNT_LIMIT.price === 'professional')? 1:parseInt((response.data.limit.board/ this.AMOUNT_LIMIT.board) * 100),
          ment: "Limit: " + this.AMOUNT_LIMIT.board
        };
        const card = this.#makeCard(data);
        this.querySelector('.row.record-body').appendChild(card);

        const data2 = {
          title: "파일",
          subTitle: "CRM에 업로드된 파일 크기",
          amount: this.#covertByteToMega(response.data.limit.file),
          color: "bg-black",
          percent: (this.AMOUNT_LIMIT.price === 'professional')? 1:parseInt((response.data.limit.file / this.AMOUNT_LIMIT.file) * 100),
          ment: "Limit: " + (this.AMOUNT_LIMIT.price === 'professional')? this.AMOUNT_LIMIT.file:this.#covertByteToMega(this.AMOUNT_LIMIT.file)
        };
        const card2 = this.#makeCard(data2);
        this.querySelector('.row.record-body').appendChild(card2);

      }
    } catch (error) {
      console.error(error);
    }
  }

  #covertByteToMega(byte)
  {
    if(byte >= 1000000000) 
    {
      return (byte / 1000 /1000 /1000).toFixed(1) + "G";
    }
    else if(byte >= 1000000) 
    {
      return (byte / 1000 /1000).toFixed(2) + "M";
    }
    else
    {
      return (byte / 1000).toFixed(2) + "K";
    }
    
  }


  #makeCard(data)
  {
    const card = document.createElement('div');
    card.classList.add('col-12', 'col-sm-6', 'col-md-6', 'col-xl-3');
    card.innerHTML =`
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <div>
              <h5><b>${data.title}</b></h5>
              <p class="text-muted">${data.subTitle}</p>
            </div>
            <h3 class="text-info fw-bold">${data.amount}</h3>
          </div>
          <div class="progress progress-sm">
            <div class="progress-bar ${data.color} role="progressbar" style="width: ${data.percent}% !important;"></div>
          </div>
          <div class="d-flex justify-content-between mt-2">
            <p class="text-muted mb-0">${data.ment}</p>
            <p class="text-muted mb-0">${data.percent}%</p>
          </div>
        </div>
      </div>`;
    return card;
  }

  #getTemplate()
  {
      const tempalate = document.createElement('template');
      tempalate.innerHTML = `
      <style>
        .w-25 { width: 25% !important;}
        .w-25 { width: 25% !important;}
        .w-25 { width: 25% !important;}
        .w-25 { width: 25% !important;}


      </style>
        <div class="card">
            <div class="card-header row-space-between">
              <span><strong>사용 기록</strong></span>
            </div>
            <div class="card-body">
                <div class="row record-body">
                 
                </div>
            </div>
        </div>
      `;  
      return tempalate;
  }
}
customElements.define("use-record", UseRecord);

