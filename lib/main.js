const {CompositeDisposable, Disposable} = require('via');
const Console = require('./console');
const ConsoleStatusView = require('./console-status-view');
const base = 'via://console';

const InterfaceConfiguration = {
    name: 'Console',
    description: 'A visual representation of all of the informational and error messages that Via outputs.',
    command: 'console:open-console',
    uri: base
};

class ConsolePackage {
    initialize(state){
        this.disposables = new CompositeDisposable();
        this.consoles = [];

        this.disposables.add(via.commands.add('via-workspace', 'console:open-console', () => via.workspace.open(base)));

        this.disposables.add(via.workspace.addOpener((uri, options) => {
            if(uri === base || uri.startsWith(base + '/')){
                const con = new Console({uri});
                this.consoles.push(con);
                return con;
            }
        }, InterfaceConfiguration));
    }

    deserialize(state){
        const con = Console.deserialize(state);
        this.consoles.push(con);
        return con;
    }

    consumeStatusBar(status){
        this.status = status;
        this.attachStatusBarView();
    }

    attachStatusBarView(){
        if(!this.statusViewAttached){
            this.statusViewAttached = new ConsoleStatusView({status: this.status});
        }
    }

    deactivate(){
        for(const con of this.consoles){
            con.destroy();
        }

        this.disposables.dispose();
        this.disposables = null;
    }
}

module.exports = new ConsolePackage();
