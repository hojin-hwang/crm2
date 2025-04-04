
class TableList extends AbstractComponent
{
  
  constructor(info)
  {
    super();
    this.messageListener = this.onMessage.bind(this)
    window.addEventListener("message", this.messageListener);

    this.addEventListener('click', this.handleClick);
    this.info = {}
    if(info) Object.assign(this.info, info);
    this.#initSetting();
  }

  static get observedAttributes(){return [];}

  handleClick(e) {
    e.composedPath().find((node)=>{
      if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
      if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
      if(node.className.match(/command-show-form/))
      {
        const _tempInfo = {"tagName":this.info.formName, "info":null}
        this.sendPostMessage({msg:"DO_SHOW_MODAL", data:_tempInfo});
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
            this.list = this.#setProductName(event.data.data.list);
            
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
    store.getDataList(this.info.name, false, "GET_DATA_LIST", this.info.formData);
    return;
  }

  #initSetting()
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
    this.querySelector('.dt-layout-row')?.appendChild(addButton);
  }

  #updateData(data)
  {
    this.table.clear();
    this.list =  this.#setProductName(data.list);
    this.table.rows.add( data.list ).draw(false);
  }

  #unSelectAllRows()
  {
    this.table.$('tr.selected').removeClass('selected');
  }

  #setProductName(list)
  {
    
    list.forEach(board => {
      let productNames = '';
      if(!board || !board.product) return;
      board.product.forEach(product=>{
        const product_info = store.getInfo('product', '_id', product.id);
        if(product_info && product_info.name) productNames += `<a href="#" class="command-filter-product">${product_info.name}</a> ,`
      })
      board.productName = productNames.replace(/,\s*$/, "");
    });
    return list
  }

  #setTable()
  {
    if(this.table)
    {
      return;
    }
    const productTableStyle = (this.info.listName === 'product')? { width: '15%', targets: [3] }:{};
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
      order: (this.info.listName === 'work-list')? [[6, 'desc']] : (this.info.order)? this.info.order :[[1, 'asc']],
      columnDefs: [
        {
            target: this.info.columnInvisible,
            visible: false
        },
        productTableStyle
        
      ],
      createdRow: function (row, data, dataIndex) {
        $('td:eq(0)', row).css('min-width', '100px');
        if (data['degree'] == '대기') {
            $(row).addClass('warning');
        }
      }
    });

    return this.table;
  }

  #appendTable(formName)
  {
    const table = this.#setTable();

    if(!table) return;

    if(this.info.name !== 'notice') this.#addNewButton();
    else if(globalThis.user.degree === '관리자') this.#addNewButton();

    table.on( 'click', 'tr', function(e){
      if ( $(this).parent().prop("tagName") === 'THEAD' ) return;
      if ( $(this).hasClass('selected') ) {
        $(this).removeClass('selected');
      }
      else {
          table.$('tr.selected').removeClass('selected');
          $(this).addClass('selected');
      }
      if(e.target.tagName === 'A') return;
      let this_row = table.rows(this).data();
        const _tempInfo = {"tagName":formName, "info":this_row[0]}
        const _message = {msg:"DO_SHOW_MODAL", data:_tempInfo}
        window.postMessage(_message, location.href);
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
customElements.define("table-list", TableList);

