const {Disposable, CompositeDisposable} = require('via');
const etch = require('etch');
const ViaTable = require('via-table');
const base = 'via://console';
const moment = require('moment');
const $ = etch.dom;

module.exports = class Console {
    static deserialize(params){
        return new Console(params);
    }

    serialize(){
        return {
            deserializer: 'Console',
            uri: this.getURI()
        };
    }

    constructor(state){
        this.disposables = new CompositeDisposable();

        this.columns = [
            {name: 'message', title: 'Message', default: true, accessor: item => item.message},
            {name: 'detail', title: 'Detail', default: true, accessor: item => item.detail},
            {name: 'time', title: 'Time', default: true, accessor: item => moment(item.date).format('YYYY-MM-DD HH:mm:ss')}
        ];

        etch.initialize(this);

        this.disposables.add(via.console.onDidLogMessage(this.update.bind(this)));
        this.disposables.add(via.console.onDidFlushLog(this.update.bind(this)));
    }

    properties(item){
        return {
            classList: `tr console-item console-${item.type}`
        };
    }

    destroy(){
        this.disposables.dispose();
        etch.destroy(this);
    }

    update(){
        etch.update(this);
    }

    render(){
        return $.div({classList: 'console'},
            $(ViaTable, {columns: this.columns, data: via.console.all(), properties: this.properties})
        );
    }

    getTitle(){
        return 'Console';
    }

    getURI(){
        return base;
    }
}
