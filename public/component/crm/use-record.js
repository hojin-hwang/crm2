// 상수 정의 ClientInfo로 빼자..
const AMOUNT_LIMIT = {
    product: 1000,
    company: 200,
    customer: 400,
    sheet:1000,
    work:5000,
    boardInfo:10,
    board:3000,
    file:1000
};

class UseRecord extends AbstractComponent
{
  constructor()
  {
    super();
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
    this.#appendBoard();
    this.#appendFile();
    return;
  }

  #appendCompany()
  {
    const data = {
      title: "고객사",
      subTitle: "CRM에 등록된 고객사",
      amount: globalThis.companyList.length,
      color: "bg-success",
      percent: parseInt((globalThis.companyList.length / AMOUNT_LIMIT.company) * 100),
      ment: "Limit: " + AMOUNT_LIMIT.company
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
      percent: parseInt((globalThis.customerList.length / AMOUNT_LIMIT.customer) * 100),
      ment: "Limit: " + AMOUNT_LIMIT.customer
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
      percent: parseInt((globalThis.sheetList.length / AMOUNT_LIMIT.sheet) * 100),
      ment: "Limit: " + AMOUNT_LIMIT.sheet
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
      percent: parseInt((globalThis.workList.length / AMOUNT_LIMIT.work) * 100),
      ment: "Limit: " + AMOUNT_LIMIT.work
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
      percent: parseInt((globalThis.productList.length / AMOUNT_LIMIT.product) * 100),
      ment: "Limit: " + AMOUNT_LIMIT.product
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
      percent: parseInt((_count / AMOUNT_LIMIT.boardInfo) * 100),
      ment: "Limit: " + AMOUNT_LIMIT.boardInfo
    };
    const card = this.#makeCard(data);
    this.querySelector('.row.record-body').appendChild(card);
  }

  async #appendBoard()
  {
    try {
      const formData = new FormData();
      const response = await util.sendFormData("/board/count", "POST", formData);
      if (response.code === 100)
      {
        const data = {
          title: "게시물",
          subTitle: "CRM에 등록된 게시물",
          amount: response.data.count,
          color: "bg-secondary",
          percent: parseInt((response.data.count/ AMOUNT_LIMIT.board) * 100),
          ment: "Limit: " + AMOUNT_LIMIT.board
        };
        const card = this.#makeCard(data);
        this.querySelector('.row.record-body').appendChild(card);
      }
    } catch (error) {
      console.error(error);
    }
  }
    

  async #appendFile()
  {
    try {
      const formData = new FormData();
      const response = await util.sendFormData("/upload/size", "POST", formData);
      if (response.code === 100)
      {
        const data = {
          title: "파일",
          subTitle: "CRM에 업로드된 파일 크기",
          amount: this.#covertByteToMega(response.data.size),
          color: "bg-black",
          percent: parseInt((response.data.size / this.#changeByteScale(AMOUNT_LIMIT.file)) * 100),
          ment: "Limit: " + AMOUNT_LIMIT.file
        };
        const card = this.#makeCard(data);
        this.querySelector('.row.record-body').appendChild(card);
      }
    } catch (error) {
      console.error(error);
    }
  }

  #covertByteToMega(byte)
  {
    if(byte > 1000000) 
    {
      return (byte / 1000 /1000).toFixed(2) + "M";
    }
    else
    {
      return (byte / 1000).toFixed(2) + "K";
    }
    
  }

  #changeByteScale(mega)
  {
    return mega * 1000 *1000;
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

