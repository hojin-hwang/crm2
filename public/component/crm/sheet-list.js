
class SheetList extends AbstractComponent
{
  constructor(info)
  {
    super();
    this.messageListener = this.onMessage.bind(this)
    window.addEventListener("message", this.messageListener);

    this.addEventListener('click', this.handleClick);
    this.info = info;
    this.#initData(info);
  }

  static get observedAttributes(){return [];}

  handleClick(e) {
    //e.preventDefault();
    e.composedPath().find((node)=>{
      if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
      if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
      if(node.className.match(/command-show-form/))
      {
        const _tempInfo = {"tagName":this.info.formName, "info":null}
        this.sendPostMessage({msg:"DO_SHOW_MODAL", data:_tempInfo});
        return;
      }
      else if(node.className.match(/command-filter-product/))
      {
        this.table.search(node.innerText, false, false).draw();
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
          case "COMMAND_CHANGE_DATA":
            setTimeout(() => {
              this.#updateData(event.data.data);
              this.#unSelectAllRows()
            }, 100);
            
          break;
          case "GET_DATA_LIST":
            this.#setProductList(event.data.data.list)
            setTimeout(() => {
              this.#appendTable(this.info.formName);
              this.#removeLabel();
            }, 100);

          break;
          default:
          break;
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
  }

  render()
  {
    const template = this.#getTemplate();
    if(template) this.appendChild(template.content.cloneNode(true));

    store.getDataList(this.info.name);
    
    return;
  }

  #initData()
  {
    if(!this.info.columnInvisible)
    {
      this.info.columnInvisible = [0]
    }
  }

  #removeLabel()
  {
    this.querySelector('.dt-search label')?.remove();
  }

  #addNewButton()
  {
    const addButton = document.createElement('div');
    addButton.innerHTML = `<button class="btn btn-primary command-show-form" type="button">${this.info.buttonTitle}</button>`;
    this.querySelector('.dt-layout-row').appendChild(addButton);
  }

  #setProductList(data)
  {
    data.forEach(info=>{
      info.productId = info.product;
      let productNames = '';
      
      info.product.forEach(product => {
        if(!product || !product.id) return;
        const product_info = store.getInfo('product', '_id', product.id);
        if(product_info && product_info.name) productNames += `<a href="#" class="command-filter-product">${product_info.name}</a> ,`
      });
      info.productName = productNames.replace(/,\s*$/, "");
    });
    this.list = data;
  }

  #updateData(data)
  {
    this.table.clear();
    this.#setProductList(data.list)
    this.table.rows.add( this.list ).draw(false);
  }

  #unSelectAllRows()
  {
    this.table.$('tr.selected').removeClass('selected');
  }


  #setTable()
  {
    if(this.table)
    {
      return;
    }
    this.table = new DataTable('#table_list', {
      retrieve: true,
      layout: {
        topEnd:null,
        topStart: {
            search: {
                label:"",
                placeholder: 'Search'
            }
        }
      },
      info:false,
      select: {
        style:'single'
      },
      displayLength:15,
      columns: [
				{ "data": "_id", "title":"id"},
				{ "data": "name", "title":"제목"},
				{ "data": "customerName", "title":"고객" },
				{ "data": "companyName", "title":"고객사" },
				{ "data": "userName", "title":"담당자" },
				{ "data": "productName", "title":"제품" },
				{ "data": "step", "title":"단계" },
				{ "data": "duedate", "title":"날짜" },
        { "data": "memo", "title":"memo" },
        { "data": "date", "title":"date" },
        {
          "className":"options",
          "data":           null,
          "title" : "수정",
          "render": ()=>'<button class="btn btn-sm btn-secondary pull-right"> 수정</button>'
        }
			],
      data: this.list,
      columnDefs: [
        {
            target: this.info.columnInvisible,
            visible: false
        },
        { width: '30%', targets: [1] },
        { width: '20%', targets: [5] }
      ],
      order: [
        [7, 'desc']
      ]
    });

    return this.table;
  }

  #appendTable(formName)
  {
    const table = this.#setTable();

    if(!table) return;

    this.#addNewButton();

    table.on( 'click', 'td', function(){
  
      const cellData = {};
      cellData.data = table.cell( this ).data();
      cellData.row = table.cell( this )[0][0]["row"];
      cellData.column = table.cell( this )[0][0]["column"];
  
      let this_row = table.rows(this).data();
      if(cellData.column === 10) //수정버튼
      {
        const _tempInfo = {"tagName":formName, "info":this_row[0]}
        const _message = {msg:"DO_SHOW_MODAL", data:_tempInfo}
        window.postMessage(_message, location.href);
        return;
      }  
      if(cellData.column === 1){
        const _tempInfo = {"tagName":'sheet-view', "info":this_row[0]}
        const _message = {msg:"DO_SHOW_MODAL", data:_tempInfo}
        window.postMessage(_message, location.href);
      }
      else if(cellData.column === 2 || cellData.column === 3 || cellData.column === 4)
      {
        
        const _selectValue = cellData.column
        table.search(cellData.data, false, false).draw();
        //table.search(cellData.data, {exact: true})
                        
      }
        
    } );

    table.on( 'click', 'tr', function(){
      if ( $(this).parent().prop("tagName") === 'THEAD' ) return;
      if ( $(this).hasClass('selected') ) {
        $(this).removeClass('selected');
      }
      else {
          table.$('tr.selected').removeClass('selected');
          $(this).addClass('selected');
      }
    } );
  }


  #getTemplate()
  {
      const tempalate = document.createElement('template');
      tempalate.innerHTML = `

      <access-user boardid="${this.info.boardId}"></access-user>
      <div class="page-header">
        <h3 class="fw-bold mb-3">${this.info.title}</h3>
      </div>
        
      <div class="card">
        <div class="card-body">
          <table id="table_list" class="display" width="100%"></table>
        </div>
      </div>

      `;  
      return tempalate;
  }
}
customElements.define("sheet-list", SheetList);

