
class CalendarBoard extends AbstractComponent
{
  constructor()
  {
    super();
    this.messageListener = this.onMessage.bind(this)
    window.addEventListener("message", this.messageListener);
    this.addEventListener('click', this.handleClick);

    this.eventId = "";
  }

  static get observedAttributes(){return [];}

  handleClick(e) {
    //e.preventDefault();
    e.composedPath().find((node)=>{
      if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
      if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
      if(node.className.match(/command-show-form/))
      {
        const _tempInfo = {"tagName":node.dataset.formName, "info":null}
        this.sendPostMessage({msg:"DO_SHOW_MODAL", data:_tempInfo});
        this.#handleAddButton();
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
              this.#updateEvent(event.data.data);
            }, 100);
            
          break;
          case "GET_DATA_LIST":
            this.#setEvents(event.data.data);
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

  disconnectedCallback(){
    window.removeEventListener("message", this.messageListener);
  }

  render()
  {
    const template = this.#getTemplate();
    if(template) this.appendChild(template.content.cloneNode(true));
    this.#showCalendar()
    return;
  }


  #showCalendar()
  {
    const calendarEl = this.querySelector('#calendar');
    this.calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      locale: 'ko',
      // customButtons: {
      //   myCustomButton: {
      //     text: '+',
      //     click: ()=>{
      //       this.#handleAddButton();
      //     }
      //   }
      // },
      headerToolbar:{
        start: 'prev,next', // will normally be on the left. if RTL, will be on the right
        center: 'title',
        end: '' // will normally be on the right. if RTL, will be on the left
      },
      navLinks:false,
      editable:false,
      
       eventClick: (info)=>{
        console.log(info);
        this.eventId = info.event.id.toString();
        console.log(info.event.extendedProps);
        this.#showForm(info.event.classNames[0], info.event.extendedProps.resourceId)
      },

      dateClick: (info)=>{
        this.#showWorkForm(info.dateStr);
      },

    });
    
    this.calendar.render();
    const workList = store.selectStoreList('work', "");
    this.#setEvents(workList);
  }

  #showWorkForm(dateStr)
  {
    const _tempInfo = {"tagName":'work-form', "info":{duedate:dateStr}}
    this.sendPostMessage({msg:"DO_SHOW_MODAL", data:_tempInfo});
  }

  #setEvents(data)
  {
    console.log(data);
    for(let i=0; i< data.list.length; i++){
      const event = {className:"work"};
      event["id"] = util.secureRandom();
      const customerName = (data.list[i]["customerName"])? data.list[i]["customerName"] : "";
      event["title"] = `${customerName} (${data.list[i]["userName"]})`;
      event["start"] = `${data.list[i]["duedate"]}T12:00:00`;
      event["resourceId"] = data.list[i]["_id"];
      this.calendar.addEvent(event);
    }
  }

  #getDataByEvent(listName, fieldName, value)
  {
    return store.getInfo(listName, fieldName, value);
  }

  #showForm(className, id)
  {
    const formName = `${className}-form`;
    const _tempInfo = {"tagName":formName, "info":this.#getDataByEvent(className, "_id", id)}
    const _message = {msg:"DO_SHOW_MODAL", data:_tempInfo}
    window.postMessage(_message, location.href);
  }

  #updateEvent(message)
  {
    this.calendar.getEventById( this.eventId )?.remove(); 
    if(!message.info) return; 
    const event = this.#setEventData(message.info, message.listName)
    this.calendar.addEvent(event);
  }

  #setEventData(data, listName)
  {
    console.log(data);
    console.log(listName);
    const event = (listName === 'work-list')? {className:"work"} : {className:"sales-work"};
    event["id"] = util.secureRandom();
    event["title"] = `${data["customerName"]} (${data["userName"]})`;
    event["start"] = `${data["duedate"]}T12:00:00`;
    event["resourceId"] = data["_id"];
    
    return event ;
  }

  #handleAddButton()
  {
    const targetElement = this.querySelector('.action-group');
    targetElement.classList.toggle('active');
  }

  #getTemplate()
  {
      const tempalate = document.createElement('template');
      tempalate.innerHTML = `
        <style>
        .fc button.fc-button-primary {
            background-color: #1572e8!important;
            border-color: #1572e8!important;
            color: var(--fc-button-text-color);
        }
        .work .fc-daygrid-event-dot {
            border: calc(var(--fc-daygrid-event-dot-width) / 2) solid #fac863;
        }
        .sales-work .fc-daygrid-event-dot {
          border: calc(var(--fc-daygrid-event-dot-width) / 2) solid #5D87FF;
        }
        .fc-event-time{display:none;}

        .action-group{
          display: none;
          flex-direction: column;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #eee;
          width: 140px;
          position: absolute;
          top: 128px;
          right: 12px;
          background-color: white;
          z-index: 1024;
        }
        .action-group.active{display:flex;}  
        </style>
        <access-user boardid="2478539972"></access-user>
        <div class="page-header">
          <h3 class="fw-bold mb-3">캘린더</h3>
        </div>

        <div class="card">
          <div class="card-body">
            <div id="calendar" style="width:100%;"></div>
          </div>
        </div>

        

        <div class="action-group">
          <button type="button" class="btn btn-outline-primary command-show-form" data-form-name="sales-work-form">영업관리</button>
          <button type="button" class="btn btn-outline-primary command-show-form" data-form-name="work-form">할일관리</button>
        </div>
      `;  
      return tempalate;
  }
}
customElements.define("calendar-board", CalendarBoard);