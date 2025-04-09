class BoardList extends AbstractComponent
{
  constructor()
  {
    super();
    this.messageListener = this.onMessage.bind(this)
    window.addEventListener("message", this.messageListener);

    this.addEventListener('click', this.handleClick);
  }

  static get observedAttributes(){return [];}

  handleClick(e) {
    //e.preventDefault();
    e.composedPath().find((node)=>{
      if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
      if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
      if(node.className.match(/command-show-board-form/))
      {
        const _tempInfo = {"tagName":'boardinfo-form', "info":null}
        this.sendPostMessage({msg:"DO_SHOW_MODAL", data:_tempInfo});
        return;
      }
      if(node.className.match(/command-show-board-user-form/))
      {
        const _tempInfo = {"tagName":'board-user-form', "info":node.dataset.id}
        this.sendPostMessage({msg:"DO_SHOW_MODAL", data:_tempInfo});
        return;
      }
      if(node.className.match(/command-show-excel-upload-form/))
      {
        const _tempInfo = {"tagName":'excel-upload-form', "info":node.dataset.tag}
        this.sendPostMessage({msg:"DO_SHOW_MODAL", data:_tempInfo});
        return;
      }
      if(node.className.match(/command-board-modify/))
      {
        const formData = new FormData();
        formData.append('_id', node.dataset.id)
        formData.append('name', node.closest('tr').querySelector('input[name=name]').value)
        store.updateInfo(formData, 'boardInfo', "COMMAND_CHANGE_DATA");
        return;
      }
      if(node.className.match(/command-board-delete/))
      {
        if(confirm('삭제하시겠습니까?'))
        {
          const formData = new FormData();
          formData.append('_id', node.dataset.id)
          store.deleteInfo(formData, 'boardInfo', "COMMAND_CHANGE_DATA");
        }
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
            store.getDataList('boardInfo');
          break;
          case "GET_DATA_LIST":
            if(event.data.data.list.length === 0)
            {
              const defaultBoardInfo = [
                {
                  name: "고객사",
                  type: "default",
                  tag: "company",
                },
                {
                  name: "고객",
                  type: "default",
                  tag: "customer",
                },
                {
                  name: "품목",
                  type: "default",
                  tag: "product",
                },
                {
                  name: "영업일지",
                  type: "default",
                  tag: "sheet",
                },
                {
                  name: "영업기회",
                  type: "default",
                  tag: "work",
                },
                {
                  name: "캘린더",
                  type: "default",
                  tag: "calendar",
                },
                {
                  name: "공지사항",
                  type: "custom",
                  tag: "notice",
                }
              ];
              defaultBoardInfo.forEach(element => {
                const _form = new FormData();
                _form.append('name', element.name);
                _form.append('type', element.type);
                _form.append('tag', element.tag);
                store.addInfo(_form, 'boardInfo', "");
              });
            }
            else this.#makeList(event.data.data)
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
    this.removeEventListener('click', this.handleClick);
  }

  render()
  {
    const template = this.#getTemplate();
    if(template) this.appendChild(template.content.cloneNode(true));
    store.getDataList('boardInfo');
    return;
  }

  #makeList(data)
  {
    let html = '';
    data.list.forEach(element => {
      
      if(element.type === 'custom')
      {
        const hiddenClass = (element.tag !== 'notice')? "":"hidden"
        
        html += `
          <tr>
            <th scope="row">
              <input type="text" class="form-control input-full" name="name" value="${element.name}">
            </th>
            <td class="text-end">
              <div class="btn-group">
                <button type="button" class="btn btn-warning command-board-modify" data-id="${element._id}">
                  수정
                </button>
                <button type="button" class="btn btn-danger command-board-delete ${hiddenClass}" data-id="${element._id}">
                  삭제
              </button>
              <button type="button" data-id="${element._id}" class="btn btn-secondary command-show-board-user-form  ${hiddenClass}">
                  사용자 관리
              </button>
            </div>
            </td>
          </tr>
        `;
      }
      else
      {
        element.class = 'hidden';
        if(element.tag === 'company' || element.tag === 'customer' || element.tag === 'product') element.class = '';
        html += `
          <tr>
            <th scope="row">
            <span class="board-name">${element.name}</span>
            </th>
            <td class="text-end">
            <button type="button" data-tag="${element.tag}" class="btn btn-dark command-show-excel-upload-form ${element.class}">
                Excel Upload
            </button>
            <button type="button" data-id="${element._id}" class="btn btn-secondary command-show-board-user-form">
                사용자 관리
            </button>
            </td>
          </tr>   
        `;
      }
    });

    this.querySelector('.board-info-list').innerHTML = html;
  }

  #getTemplate()
  {
      const tempalate = document.createElement('template');
      tempalate.innerHTML = `
        <style>
          .table>tbody>tr>td, .table>tbody>tr>th {
              padding: 16px 0px !important;
          }
          .btn-group{width:fit-content!important;}
          .board-name{
            padding-left: 12px;
          }
        </style>
        <div class="card">
            <div class="card-header row-space-between">
            <span><strong>게시판 관리</strong></span>
            <button type="button" class="btn btn-sm btn-icon command-show-board-form">
                  <i class="fas fa-plus"></i>
            </button>
            </div>
            <div class="card-body">
                <table class="table align-items-center mb-0">
                  <thead class="thead-light">
                    <tr>
                      <th scope="col">게시판 이름</th>
                      
                      <th scope="col" class="text-end">설정</th>
                    </tr>
                  </thead>
                  <tbody  class="board-info-list">
                    
                  </tbody>
                </table>

            </div>
        </div>
      `;  
      return tempalate;
  }
}
customElements.define("board-list", BoardList);

