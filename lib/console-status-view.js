const {CompositeDisposable, Disposable, Emitter} = require('via');
const etch = require('etch');
const $ = etch.dom;
const timeout = 10000;

module.exports = class ConsoleStatusView {
    constructor({status, action}){
        this.status = status
        this.action = action
        this.disposables = new CompositeDisposable();
        this.message = null;
        this.timeout = null;

        etch.initialize(this);

        this.statusBarTile = this.status.addLeftTile({item: this});

        this.disposables.add(via.console.onDidLogMessage(this.update.bind(this)));
        this.disposables.add(via.console.onDidFlushLog(this.update.bind(this)));
    }

    render(){
        const last = via.console.last();

        if(last && last.date.getTime() + timeout > Date.now() && (!this.message || last.priority >= this.message.priority)){
            this.message = last;

            if(this.timeout){
                clearTimeout(this.timeout);
            }

            this.timeout = setTimeout(() => {
                this.message = null;
                this.timeout = null;
                this.update();
            }, timeout);
        }

        const message = this.message ? this.message.message : 'No Recent Messages';
        const status = this.message ? this.message.type : 'empty';

        return $.div({classList: `console-status toolbar-button console-${status}`, onClick: this.open}, message);
    }

    open(){
        via.workspace.open('via://console');
    }

    update(){
        etch.update(this);
    }

    destroy(){
        this.statusBarTile.destroy();
        this.disposables.dispose();
    }
}