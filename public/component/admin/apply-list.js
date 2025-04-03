
class ApplyList extends AbstractComponent
{
  
  constructor()
  {
    super();
    this.messageListener = this.onMessage.bind(this)
    window.addEventListener("message", this.messageListener);

    this.addEventListener('click', this.handleClick);
    this.info = {
      "title":"Apply 리스트",
      "formName":"make-client",
      "order":[[3, 'desc']],
      "columns":[
        { "data": "_id", "title":"id"},
        { "data": "clientId", "title":"Client ID"},
        { "data": "name", "title":"신청자"},
        { "data": "email", "title":"email"},
        { "data": "date", "title":"등록일" },
        {
          "className":"options",
          "data": null,
          "title" : "보기",
          "render": ()=>'<button class="btn btn-sm btn-primary pull-right">보기</button>'
        },
        {
          "className":"options",
          "data": null,
          "title" : "삭제",
          "render": ()=>'<button class="btn btn-sm btn-danger pull-right"> 삭제</button>'
        }
      ]
    }
    
    this.#initSetting();
  }

  static get observedAttributes(){return [];}

  handleClick(e) {
    //e.preventDefault();
    e.composedPath().find((node)=>{
      if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
      if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
      if(node.className.match(/command-show-form/))
      {
        const _tempInfo = {"tagName":'make-client', "info":null}
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
              this.#unSelectAllRows()
            }, 100);
            
          break;
          case "GET_DATA_LIST":
            this.list = event.data.data;
            setTimeout(() => {
              this.#appendTable();
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
    this.#getClientList()
    return;
  }

  async #getClientList()
	{
		try{
      const formData = new FormData();
			const response = await util.sendFormData(`/apply/list`, "POST", formData);
      if(response.code === 100)
      {
        const message =  {msg:"GET_DATA_LIST", data:response.data.list} 
				window.postMessage(message, location.href);
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

  #initSetting()
  {
    if(!this.info.columnInvisible)
    {
      this.info.columnInvisible = [0]
    }
  }

  #addNewButton()
  {
    const addButton = document.createElement('div');
    addButton.innerHTML = `<button class="btn btn-primary command-show-form" type="button">New Client 만들기</button>`;
    this.querySelector('.dt-layout-row')?.appendChild(addButton);
  }

  #updateData(data)
  {
    this.list = this.list.filter(apply => apply._id !== data._id);
    
    this.table.clear();
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
    const productTableStyle = {};
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
      order: (this.info.order),
      columnDefs: [
        {
            target: this.info.columnInvisible,
            visible: false
        },
        productTableStyle
        
      ],
      createdRow: function (row, data, dataIndex) {
        $('td:eq(0)', row).css('min-width', '100px');
      }
    });

    return this.table;
  }

  #appendTable()
  {
    const table = this.#setTable();

    if(!table) return;

    this.#addNewButton();

    table.on( 'click', 'td', function () {
  
      const cellData = {};
      cellData.data = table.cell( this ).data();
      cellData.row = table.cell( this )[0][0]["row"];
      cellData.column = table.cell( this )[0][0]["column"];
  
      let this_row = table.rows(this).data();
      if(cellData.column === 5) //Client 만들기
      {
        const _tempInfo = {"tagName":'make-client', "info":this_row[0]}
        const _message = {msg:"DO_SHOW_MODAL", data:_tempInfo}
        window.postMessage(_message, location.href);
        return;
      }  
      if(cellData.column === 6){
        // const _tempInfo = {"tagName":'client-delete-form', "info":this_row[0]}
        // const _message = {msg:"DO_SHOW_MODAL", data:_tempInfo}
        // window.postMessage(_message, location.href);
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
      <div class="page-header">
        <h3 class="fw-bold mb-3">Apply List</h3>
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
customElements.define("apply-list", ApplyList);

