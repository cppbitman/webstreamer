/**
 * Created by Ganchao on 2018/3/1.
 */

const Plugin = require('node-plugin').Plugin;
let events = require('events');
const EventEmitter = new events.EventEmitter();

var os = require('os')
var fs= require("fs")

var Promise = require('bluebird');

platform = os.platform()
arch = os.arch()
_EXT = '.so'
if (platform == 'win32') {
	platform = 'windows'
	_EXT = '.dll'
}

function gstreamer_paths(){

    var name =null
    var default_root = null;
    var platform = os.platform()
    var arch = os.arch()

    switch(platform){
        case 'win32':
          default_root = 'c:/gstreamer/1.0'
        break;
        default:
          console.log( platform ,"platform not support!")
          return undefined;
        break;
    }

    switch(arch){
        case 'x64':
            name = 'GSTREAMER_1_0_ROOT_X86_64'
            default_root +='/x86_64'
        break;
        default:
            console.log( arch ," arch not support!")
            return undefined
        break;
    }
    
    var root = process.env[name]
    if( root ){

    } else {
        //guess
        root = default_root
    }

    var inspect = null
    var bin = root

    if( platform == 'win32'){
        inspect = root +'\\bin\\gst-inspect-1.0.exe'
        bin = root +'\\bin;'
    }

    if (!fs.existsSync( inspect) )
    {
        console.log("gstreamer installation may not correctlly in ",root)
        return undefined
    }
    return { 'root':root ,'bin':bin}

/*  process.env.PATH= bin + process.env.PATH
    const { spawn } = require('child_process');
    const ls = spawn('gst-inspect-1.0', ['--version']);
    ls.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    });

    ls.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
    });

    ls.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    });*/
}


class WebStreamer  {
    constructor() {
        //super();
        this.name = 'webstreamer';
        this.plugin_ = new Plugin('libwebstreamer');
    }

    initialize(options) {
        var gstpath = gstreamer_paths()
        if( gstpath === undefined ){
            return new Promise(function (resolve, reject) {
                reject({
                    name: 'initialize',
                    message: 'GStreamer can not be found.'
                })
            })
        }

        if( !process.env.LIBWEBSTREAMER_PATH ){
            return new Promise(function (resolve, reject) {
                reject({
                    name: 'initialize',
                    message: 'envirment var LIBWEBSTREAMER_PATH not set.'
                })
            })            
        }
        var pluginopt ={
            
            directory: process.env.LIBWEBSTREAMER_PATH
        }

        var path = pluginopt.directory + '/libwebstreamer' +_EXT

        if (!fs.existsSync(path)){
            return new Promise(function (resolve, reject) {
                reject({
                    name: 'initialize',
                    message: path + ' not exists.'
                })
            })
        }

        if( options === undefined ){
            options={
                'plugin':pluginopt
            }
        } else {
            options['plugin'] = pluginopt
        }

        process.env.PATH = gstpath.bin + process.env.PATH

        return this.plugin_.initialize(options)
    }

    on_notify_(buf){
        console.log(buf.toString());
    }

    terminate(){
        return this.plugin_.terminate();
    }

    call_(buf){
        return this.plugin_.call(buf);
    }

    version(){
        return this.plugin_.version();
    }

    
}



//var process = require('process')
//console.log('* arch = ',os.arch())
//arch = os.arch()
//var ENV_GSTREAMER_NAME=null
//switch(arch){
//    case 'x64s':
//    ENV_GSTREAMER_NAME = 'GSTREAMER_1_0_ROOT_X86_64'
//    break;
//}
//if ( ENV_GSTREAMER_NAME === null ){
//    console.log( arch ," arch not support!")
//}
//console.log('===！',process.env[ENV_GSTREAMER_NAME])
//console.log('===',process.env.GSTREAMER_1_0_ROOT_X86_64)
async function test(){
    var ws = new WebStreamer()
    try{
       await ws.initialize({user:"abc"})
       console.log( ws.version )
       console.log("***************************");
       await ws.terminate()
    
    } catch(err ) {
        console.log(err);
           // throw new Error(err.toString());
    }
}

//test()
module.exports =  {
    WebStreamer : WebStreamer,
}