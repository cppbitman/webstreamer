

class IProcessor  {

    constructor(webstreamer,name) {
        this.name = name
        this.webstreamer = webstreamer
        this.options = null;
    }

    async initialize(options) {

        //create processor (pipe of gstreamer)
        if( ! this.type ){
            return this.failure("initialize failed because type not specified.")
        }

        await this.call('create',options)

        //await this.call('processor.initialize',options)

    }

    async terminate() {

        await this.call('destroy')
    }

    reject(message){
        return new Promise(function (resolve, reject) {
            reject({
                name: this.name,
                type : this.type,
                message: message
            })
        })
    }

    call(action, obj){
        var request ={
            name : this.name,
            type : this.type,
            action: action,
        }
        if (obj !==undefined){
            request.content = obj
        }
        var data =  Buffer.from( JSON.stringify(request), 'utf8' )
        
        var self = this;
        return new Promise(function (resolve, reject) {
            self.webstreamer.call_(data).then( value =>{
                if( value === undefined ) {
                    resolve();
                } else {
                    var data = value.toString();
                    if( data.length <=0 ){
                        resolve();
                    } else {
                        var obj  = JSON.parse(data);
                        resolve(obj);}
                    }
            }).catch( err =>{
                reject(err);
            })
        })
    }

}


module.exports = {
    IProcessor : IProcessor
};