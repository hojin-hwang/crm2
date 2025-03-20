
class CustomBoard extends AbstractComponent
{
  constructor(info)
  {
    super();
    this.messageListener = this.onMessage.bind(this)
    window.addEventListener("message", this.messageListener);

    this.addEventListener('click', this.handleClick);
    this.info = info;
    this.#initData();
    this.tableRowIndex = -1;
  }

  static get observedAttributes(){return [];}

  handleClick(e) {
    //e.preventDefault();
    e.composedPath().find((node)=>{
      if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
      if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
      if(node.className.match(/command-show-form/))
      {
        const info = {};
        info.boardId = this.info.id;
        info.contentsId = "";
        info.userId = globalThis.user.userId;
        
        const _tempInfo = {"tagName":this.info.formName, "info":info}
        this.sendPostMessage({msg:"DO_SHOW_MODAL", data:_tempInfo});
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
              //this.#unSelectAllRows()
            }, 100);
            
          break;

          case "COMMAND_DELETE_DATA":
            this.table.row(this.tableRowIndex).remove().draw();
          break;
          
          case "GET_BOARD_LIST":
            this.list = event.data.data;
            setTimeout(() => {
              this.#appendTable(this.info.formName);
              this.#removeLabel();
            }, 100);
          break; 
          
          case "GET_SELECT_ROW_INDEX":
            this.tableRowIndex = event.data.data;
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

    store.getCustomBoard(this.info.id);
    
    return;
  }

  #initData()
  {
    if(!this.info.columnInvisible)
    {
      this.info.columnInvisible = [0,1,7]
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
    this.querySelector('.dt-layout-row')?.appendChild(addButton);
  }

  #updateData(data)
  {
    console.log(data)
    if(!data.productName) data.productName = "";
    if(this.tableRowIndex === -1 || data.new) 
    {
      this.table.row.add(data).draw();
    }
    else this.table.row(this.tableRowIndex).data(data);
    return;
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
    
    this.list.forEach(info=>{
      let productNames = '';
      const currentProducts = info.product.split(',');
      currentProducts.forEach(id => {
        if(!id) return;
        const product_info = store.getInfo('product-list', 'id', id);
        if(product_info && product_info.name) productNames += `${product_info.name} ,`
      });
      info.productName = productNames.replace(/,\s*$/, "");
    });

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
      columns: this.info.columns,
      data: this.list,
      order: [[2, 'desc']],
      columnDefs: [
        {
            target: this.info.columnInvisible,
            visible: false
        }
      ],
      createdRow: function (row, data, dataIndex) {
        $('td:eq(0)', row).css('min-width', '110px');
        if (data['degree'] == '대기') {
            $(row).addClass('warning');
        }
      }
    });

    return this.table;
  }

  #appendTable()
  {
    const table = this.#setTable();

    if(!table) return;

    this.#addNewButton();

    table.on( 'click', 'tr', function(){
      if ( $(this).parent().prop("tagName") === 'THEAD' ) return;
      if ( $(this).hasClass('selected') ) {
        $(this).removeClass('selected');
      }
      else {
          table.$('tr.selected').removeClass('selected');
          $(this).addClass('selected');
      }
      
      let this_row = table.rows(this).data();
      window.postMessage({msg:"GET_SELECT_ROW_INDEX", data:table.row(this).index()}, location.href);

      const _tempInfo = {"tagName":"contents-container", "info":this_row[0]}
      const _message = {msg:"DO_SHOW_MODAL", data:_tempInfo}
      window.postMessage(_message, location.href);
    } );
  }


  #getTemplate()
  {
      const tempalate = document.createElement('template');
      tempalate.innerHTML = `
      <access-user boardid="${this.info.id}"></access-user>
        <div class="card">
          <div class="card-header">
            <h5 class="card-title fw-semibold">${this.info.name}</h5>
          </div>
        </div>
        <table id="table_list" class="display" width="100%"></table>
      `;  
      return tempalate;
  }
}
customElements.define("custom-board", CustomBoard);

