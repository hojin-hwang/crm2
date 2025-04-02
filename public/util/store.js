class Store{
	constructor()
	{
		globalThis.productList = [];
		globalThis.materialList = [];
		globalThis.assembleList = [];
		globalThis.companyList = [];
		globalThis.customerList = [];
		globalThis.workList = [];
		globalThis.salesWorkList = [];
		globalThis.noticeList = [];
		globalThis.userList = [];
		globalThis.salesSheetList = [];
		globalThis.boardInfoList = [];
		globalThis.userBoardList = [];
	}
	
	getInfo(collection, fieldName, value)
	{
		const _listInfo = this.selectStoreList(collection)

		for(let i=0; i< _listInfo.list.length; i++)
		{
			if(_listInfo.list[i][fieldName].toString() === value.toString()) return _listInfo.list[i]
		}
		return null;
	}

	addInfo(formData, collection, command)
	{
		
		util.sendFormData(this.addApiUrl(collection), "POST", formData ).then((response) =>
		{
				if (100 == response.code)
				{
					const _listInfo = this.selectStoreList(collection, command)
					if(_listInfo)
					{
						_listInfo.list?.push(response.data.info);
						_listInfo.info = response.data.info;
						_listInfo.collection = collection;
					}

					const message = {msg:command, data:_listInfo}
					window.postMessage(message, location.href);
					return;
				}
				else
				{
						if (response.message) alert(response.message, true);
						else console.dir(response); 
				}       
		});

		return;
	}

	deleteInfo(formData, collection, command)
	{
		const info = {};
		for (const pair of formData.entries()) {
			info[pair[0]] = pair[1];
		}
		formData.append('used', 'N')	
		util.sendFormData(this.deleteApiUrl(collection), "POST", formData ).then((response) => 
		{
				if (100 == response.code)
				{
					const _listInfo = this.selectStoreList(collection, command);
					if(!_listInfo.list) return;
					let startIndex = _listInfo.list.length;
					for(let i=0; i< _listInfo.list.length; i++)
					{
						if(_listInfo.list[i]["_id"].toString() === info["_id"].toString()) startIndex = i;
					}
					_listInfo.list.splice(startIndex, 1);
					_listInfo.collection = collection;
					const message = {msg:command, data:_listInfo}
					window.postMessage(message, location.href);
				}
				else
				{
						if (response.message) alert(response.message, true);
						else console.dir(response); 
				}       
		});
	}

	removeInfo(formData, collection, command)
	{
		const info = {};
		for (const pair of formData.entries()) {
			info[pair[0]] = pair[1];
		}

		ttb.get_json_request("POST", this.deleteApiUrl(collection), formData, (response)=>
		{
				if (100 == response.code)
				{
					const message = {msg:command, data:null}
					window.postMessage(message, location.href);
				}
				else
				{
						if (response.message) alert(response.message, true);
						else console.dir(response); 
				}       
		});
	}

	updateInfo(formData, collection, command)
	{
		const info = {};
		for (const pair of formData.entries()) {
			info[pair[0]] = pair[1];
		}
		info['date'] = util.getDayDashFormat(new Date())

		util.sendFormData(this.updateApiUrl(collection), "POST", formData ).then((response) => {
			if (100 == response.code)
				{
					const _listInfo = this.selectStoreList(collection, command)
					
					for(let i=0; i< _listInfo.list.length; i++)
					{
						if(_listInfo.list[i]["_id"].toString() === response.data.info["_id"].toString()) {
							_listInfo.list[i] = response.data.info;
						}
					}
					_listInfo.info = response.data.info;
					_listInfo.collection = collection;

					const message = {msg:command, data:_listInfo}
					window.postMessage(message, location.href);

					return;
				}
				else
				{
						if (response.message) alert(response.message, true);
						else console.dir(response); 
				} 
		});

	}

	selectStoreList(collection, command = null)
	{
		const storeList = {};
		storeList.command = command ;
		storeList.list = globalThis[collection + 'List'];
		return storeList;
	}


	getDataList(collection, search = false, command = "GET_DATA_LIST", _formData = null)
	{
		this.#performanceMonitor.start()
		const formData = (_formData)? _formData : new FormData();
		util.sendFormData(this.getListApiUrl(collection), "POST", formData).then((response) => {
			if (100 == response.code)
				{
					this.getGlobalList(collection, response.data.list);
					const message = (search)? {msg:"GET_SEARCH_DATA_LIST", data:response.data.list} :{msg:command, data:{collection:collection, list:response.data.list}}
					window.postMessage(message, location.href);
					return;
				}
				else
				{
						if(response.code == 401)
						{
							window.location.href = '/user/login';
							return;
						}
						if (response.message) alert(response.message, true);
						else console.dir(response); 
				} 
		});
		this.#performanceMonitor.end('데이터 목록 로딩');
	}


	getListApiUrl(collectionName, code = null)
	{
		return "/"+collectionName + "/list" + (code ? code : '');
	}

	addApiUrl(collectionName)
	{
		return "/"+collectionName + "/add";
	}
			
	updateApiUrl(collectionName)
	{
		return "/"+collectionName + "/update";
	}

	deleteApiUrl(collectionName)
	{
		return "/"+collectionName + "/delete";
	}

	getGlobalList(collectionName, list)
	{
		const listName = `${collectionName}List`;
		globalThis[listName] = list;
		return;
	}
	
	#performanceMonitor = {
    startTime: null,
    
    start() {
        this.startTime = performance.now();
    },
    
    end(operation) {
        const duration = performance.now() - this.startTime;
        console.debug(`${operation} 수행 시간: ${duration.toFixed(2)}ms`);
    }
  }

	setInitConfig(){
		return {
			"sheet":{
				"title":"영업기회 리스트",
				"buttonTitle":"영업기회 등록",
				"name":"sheet",
				"formName":"sheet-form",
				"boardId":"615103576",
				"columnInvisible":[0,8,9]
			},
			"product":{
				"title":"품목 리스트",
				"buttonTitle":"품목 등록",
				"name":"product",
				"formName":"product-form",
				"boardId":"2498029936",
				"columns":[
					{ "data": "_id", "title":"id"},
					{ "data": "code", "title":"제품코드"},
					{ "data": "name", "title":"제품이름" },
					{ "data": "brand", "title":"제조사" }
				]
			},
			"company":{
				"title":"고객사 리스트",
				"buttonTitle":"신규 고객사",
				"name":"company",
				"formName":"company-form",
				"boardId":"2569258608",
				"columns":[
					{"data": "_id", "title":"id"},
					{ "data": "name", "title":"고객사 이름" },
					{ "data": "address", "title":"주소" },
					{ "data": "userName", "title":"담당자" }
				]
			},
			"customer":{
				"title":"고객 리스트",
				"buttonTitle":"신규 고객",
				"name":"customer",
				"formName":"customer-form",
				"boardId":"3231417172",
				"columns":[
					{ "data": "_id", "title":"id"},
					{ "data": "name", "title":"고객 이름" },
					{ "data": "companyName", "title":"고객사" },
					{ "data": "hp", "title":"핸드폰" },
					{ "data": "email", "title":"이메일" },
					{ "data": "userName", "title":"담당자" }
				]
			},
			"user":{
				"title":"사용자 리스트",
				"buttonTitle":"신규 사용자",
				"name":"user",
				"formName":"user-form",
				"columns":[
					{ "data": "_id", "title":"id"},
					{ "data": "username", "title":"email"},
					{ "data": "name", "title":"이름" },
					{ "data": "position", "title":"직급" },
					{ "data": "department", "title":"부서" },
					{ "data": "date", "title":"등록일" },
					{ "data": "degree", "title":"권한" }
				]
			},
			"notice":{
				"title":"공지사항 리스트",
				"buttonTitle":"새로운 공지사항",
				"name":"notice",
				"formName":"notice-form",
				"order":[[3, 'desc']],
				"columns":[
					{ "data": "id", "title":"id"},
					{ "data": "title", "title":"제목"},
					{ "data": "date", "title":"등록일" }
				]
			},
			"work":{
				"title":"영업일지 리스트",
				"buttonTitle":"영업일지 등록",
				"name":"work",
				"formName":"work-form",
				"boardId":"871571433",
				"columns":[
					{ "data": "_id", "title":"id"},
					{ "data": "name", "title":"제목"},
					{ "data": "customerName", "title":"고객" },
					{ "data": "companyName", "title":"고객사"},
					{ "data": "status", "title":"유형"},
					{ "data": "userName", "title":"담당자"},
					{ "data": "duedate", "title":"날짜"}
				]
			},
			"board":{
				"buttonTitle":"새로운 글",
				"name":"board",
				"formName":"board-form",
				"columnInvisible":[0,5,6],
				"order":[[4, 'desc']],
				"columns":[
					{ "data": "_id", "title":"id"},
					{ "data": "title", "title":"제목"},
					{ "data": "customerName", "title":"고객"},
					{ "data": "productName", "title":"제품"},
					{ "data": "duedate", "title":"날짜" },
					{ "data": "contents", "title":"내용" },
					{ "data": "companyName", "title":"고객사"},
					
				]
			},
			"notice":{
				"buttonTitle":"새로운 글",
				"name":"board",
				"formName":"board-form",
				"columnInvisible":[0,2],
				"order": [[3, 'desc']],
				"columns":[
					{ "data": "_id", "title":"id"},
					{ "data": "title", "title":"제목"},
					{ "data": "contents", "title":"내용" },
					{ "data": "duedate", "title":"날짜" },
				]
			}
		}
	}

}

 

const store = new Store();
