class Store{
	constructor()
	{

	}
	
	#handleError(response) {
        if (response.message) {
            alert(response.message);
        } else {
            console.error('오류 발생:', response);
        }
    }

	async addInfo(formData, collection, command)
	{
		try{
			const response = await util.sendFormData("/upload/list", "POST", formData);
			if (response.code === 100) 
			{
				//
			}
			else
			{
				this.#handleError(response);
			}
		}
		catch (error) {
            console.error('이미지 삭제 중 오류:', error);
            alert('이미지 삭제에 실패했습니다.');
        }
		return;
	}

	
}

 

const store = new Store();
