var mysql = require('mysql');

var m_connection = Symbol('connection');
var m_transaction = Symbol('transaction');

class MySQL {
    constructor(connection) {
        this[m_connection] = connection;
        this[m_transaction] = false;
    }

    query(sql) {
        var self = this;
        return new Promise((resolve, reject) => {
            self[m_connection].query(sql, (error, data, fields) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            });
        });
    }

    execute(sql) {
        return this.query(sql);
    }

    close() {
        var self = this;
        return new Promise((resolve, reject) => {
            self[m_connection].end((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    isTransactionSupported() {
        return true;
    }

    inTransaction() {
        return this[m_transaction];
    }

    beginTransaction() {
        var self = this;
        if (this.inTransaction() == true) {
            return Promise.resolve(false);
        }
        return new Promise((resolve, reject) => {
            this.execute('START TRANSACTION')
            .then(() => {
                self[m_transaction] = true;
                resolve(true);
            })
            .catch(error => {
                reject(error);
            });
        });
    }

    commit() {
        var self = this;
        if (this.inTransaction() == false) {
            return Promise.resolve(false);
        }
        return new Promise((resolve, reject) => {
            this.execute('COMMIT')
            .then(() => {
                self[m_transaction] = false;
                resolve(true);
            })
            .catch(error => {
                reject(error);
            })
        });
    }

    rollback() {
        var self = this;
        if (this.inTransaction() == false) {
            return Promise.resolve(false);
        }
        return new Promise((resolve, reject) => {
            this.execute('ROLLBACK')
            .then(() => {
                self[m_transaction] = false;
                resolve(true);
            })
            .catch(error => {
                reject(error);
            })
        });
    }
}

module.exports = {
    open: function(connection) {
        let base = mysql.createConnection({
            host: connection.Hostname || 'localhost',
            port: parseInt(connection.Port) || 3306,
            user: connection.Username || 'root',
            password: connection.Password,
            database: connection.Database
        });
        return new MySQL(base);
    }
};