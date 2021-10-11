import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private dbInstance: SQLiteObject;
  readonly db_name: string = "ctiempo.db";
  readonly ini_sql = [
    `CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY, 
      name VARCHAR(64),
      number_tasks INTEGER DEFAULT 0,
      icon VARCHAR(32)
    )`,
    `CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY, 
      category_id INTEGER, 
      name VARCHAR(128),
      number_trackings INTEGER DEFAULT 0,
      last_tracking INTEGER DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS trackings (
      id INTEGER PRIMARY KEY, 
      task_id INTEGER, 
      tracking_date VARCHAR(16), 
      tracking_start VARCHAR(16),
      seconds INTEGER, 
      tracking_time VARCHAR(16),
      close_tracking INTEGER
    )`
  ];

  public CATEGORIES: Array <any>;
  public TASKS: Array <any>;
  public TRACKINGS: Array <any>;

  constructor(private platform: Platform,
              private sqlite: SQLite) { 
    console.log("constructor db.service");
    this.databaseConn();
  }

  databaseConn() {
    this.platform.ready().then(() => {
      this.sqlite.create({
          name: this.db_name,
          location: 'default'
      }).then((sqLite: SQLiteObject) => {
        this.dbInstance = sqLite;

        let execIni = localStorage.getItem("executeIni");
        if (!execIni) {
          this.execSqlDefault(this.ini_sql, 0);
        } else {
          this.getAllCategories();
          this.getAllTasks();
          this.getTrackings('', this.getToday());
        }
      })
      .catch((error) => console.log(JSON.stringify(error)));
    });   
  }

  execSqlDefault(sqlStr: String[], index: number) {
    if (index < sqlStr.length) {
      this.dbInstance.executeSql(`${sqlStr[index]}`, [])
      .then((res) => {
        console.log("exec sql table number "+index);
        console.log(JSON.stringify(res));
        index++;
        this.execSqlDefault(sqlStr, index);
      })
      .catch((error) => console.log(JSON.stringify(error)));
    } else {
      let language = localStorage.getItem("chosenLanguage");
      let inserts_lan = (language == 'en' ? `INSERT INTO categories (name, icon) VALUES ('job', 'briefcase'), ('sport', 'bicycle'), ('hobbie', 'balloon')` : `INSERT INTO categories (name, icon) VALUES ('trabajo', 'briefcase'), ('deporte', 'bicycle'), ('hobbie', 'balloon')`);

      this.dbInstance.executeSql(inserts_lan, [])
      .then((res) => {
        console.log("exec sql inserts");
        console.log(JSON.stringify(res));

        this.getAllCategories();
        this.getAllTasks();
        this.getTrackings('', this.getToday());
        localStorage.setItem("executeIni", "yes");
      })
      .catch((error) => console.log(JSON.stringify(error)));
    }
  }

  getAllCategories() {
    return this.dbInstance.executeSql(`SELECT * FROM categories`, []).then((res) => {
      this.CATEGORIES = [];
      if (res.rows.length > 0) {
        for (let i = 0; i < res.rows.length; i++) {
          this.CATEGORIES.push(res.rows.item(i));
        }
        console.log(this.CATEGORIES);
        return this.CATEGORIES;
      }
    },(e) => {
      console.log(JSON.stringify(e));
    });
  }

  getAllTasks() {
    return this.dbInstance.executeSql(
      `SELECT tasks.*, categories.name AS category_name, categories.icon AS category_icon FROM tasks
      LEFT JOIN categories ON tasks.category_id = categories.id`, []).then((res) => {
      this.TASKS = [];
      if (res.rows.length > 0) {
        for (let i = 0; i < res.rows.length; i++) {
          this.TASKS.push(res.rows.item(i));
        }
        console.log(this.TASKS);
        return this.TASKS;
      }
    },(e) => {
      console.log(JSON.stringify(e));
    });
  }

  getTrackings(task_id, tracking_date) {
    let sqlTrackings = `SELECT trackings.*, tasks.name AS task_name, categories.name AS category_name, categories.icon AS category_icon FROM trackings
      LEFT JOIN tasks ON trackings.task_id = tasks.id
      LEFT JOIN categories ON tasks.category_id = categories.id
      WHERE tracking_date = '${tracking_date}'
      ORDER BY close_tracking DESC`;
    if (task_id != '') {
      sqlTrackings = `SELECT trackings.*, tasks.name AS task_name, categories.name AS category_name, categories.icon AS category_icon FROM trackings
      LEFT JOIN tasks ON trackings.task_id = tasks.id
      LEFT JOIN categories ON tasks.category_id = categories.id
      WHERE trackings.tracking_date = '${tracking_date}'
      AND trackings.task_id = ${task_id}
      ORDER BY close_tracking DESC`;
    }

    console.log(sqlTrackings);

    return this.dbInstance.executeSql(`${sqlTrackings}`, []).then((res) => {
      this.TRACKINGS = [];
      if (res.rows.length > 0) {
        for (let i = 0; i < res.rows.length; i++) {
          this.TRACKINGS.push(res.rows.item(i));
        }
        console.log(this.TRACKINGS);
        return this.TRACKINGS;
      }
    },(e) => {
      console.log(JSON.stringify(e));
    });
  }

  getDataToChart(start, end): Promise<Array <any> > {
    let sqlDataToChar = `SELECT trackings.*, tasks.name AS task_name, tasks.category_id AS category_id, categories.name AS category_name, categories.icon AS category_icon FROM trackings
      LEFT JOIN tasks ON trackings.task_id = tasks.id
      LEFT JOIN categories ON tasks.category_id = categories.id
      WHERE trackings.close_tracking >= '${start}'
      AND trackings.close_tracking <= '${end}'`;

    return this.dbInstance.executeSql(`${sqlDataToChar}`, []).then((res) => {
      let ndata = [];
      if (res.rows.length > 0) {
        for (let i = 0; i < res.rows.length; i++) {
          ndata.push(res.rows.item(i));
        }
        console.log(ndata);
      }
      return ndata;
    });
  }

  addCategory(name, icon) {
    this.dbInstance.executeSql(`
      INSERT INTO categories (name, icon) VALUES ('${name}', '${icon}')`, [])
    .then(() => {
      console.log("success add category");
      this.getAllCategories();
    }, (e) => {
      console.log(JSON.stringify(e.err));
    });
  }

  addTask(name, category_id) {
    this.dbInstance.executeSql(`
      INSERT INTO tasks (name, category_id) VALUES ('${name}', '${category_id}')`, [])
    .then((row) => {
      console.log("success add task");
      console.log('Appointment inserido com sucesso. Id:', row);
      this.dbInstance.executeSql(`
        UPDATE categories SET number_tasks = number_tasks + 1 WHERE id = ${category_id}`, [])
      .then(() => {
        this.getAllTasks();
        this.getAllCategories();
      }, (e) => {
        console.log(JSON.stringify(e.err));
      });
    }, (e) => {
      console.log(JSON.stringify(e.err));
    });
  }

  addTracking(task_id, tracking_date, tracking_start, seconds, close_tracking, tracking_time) {
    this.dbInstance.executeSql(`
      INSERT INTO trackings (task_id, tracking_date, tracking_start, seconds, close_tracking, tracking_time) 
      VALUES ('${task_id}', '${tracking_date}', '${tracking_start}', '${seconds}', '${close_tracking}', '${tracking_time}')`, [])
    .then(() => {
      console.log("success add tracking");
      this.dbInstance.executeSql(`
        UPDATE tasks SET number_trackings = number_trackings + 1 WHERE id = ${task_id}`, [])
      .then(() => {
        this.getTrackings('', tracking_date);
        this.getAllTasks();
      }, (e) => {
        console.log(JSON.stringify(e.err));
      });
    }, (e) => {
      console.log(JSON.stringify(e.err));
    });
  }

  addTrackingAndTask(name, category_id, tracking_date, tracking_start, seconds, close_tracking, tracking_time) {
    this.dbInstance.executeSql(`
      INSERT INTO tasks (name, category_id, number_trackings) VALUES ('${name}', '${category_id}', '1')`, [])
    .then((row) => {
      console.log("success add task");
      console.log('task Id:', row.insertId);
      this.dbInstance.executeSql(`
        UPDATE categories SET number_tasks = number_tasks + 1 WHERE id = ${category_id}`, [])
      .then(() => {
        this.dbInstance.executeSql(`
          INSERT INTO trackings (task_id, tracking_date, tracking_start, seconds, close_tracking, tracking_time) 
          VALUES ('${row.insertId}', '${tracking_date}', '${tracking_start}', '${seconds}', '${close_tracking}', '${tracking_time}')`, [])
        .then(() => {
          console.log("success add tracking");
          this.getTrackings('', tracking_date);
          this.getAllTasks();
          this.getAllCategories();
        }, (e) => {
          console.log(JSON.stringify(e.err));
        });
      }, (e) => {
        console.log(JSON.stringify(e.err));
      });
    }, (e) => {
      console.log(JSON.stringify(e.err));
    });
  }

  updateCategory(id, name, icon) {
    let data = [name, icon];
    this.dbInstance.executeSql(
      `UPDATE categories SET name = ?, icon = ? WHERE id = ${id}`, data)
    .then(() => {
      console.log("success edit category");
      this.getAllCategories();
      this.getAllTasks();
    }, (e) => {
      console.log(JSON.stringify(e.err));
    });
  }

  updateTask(id, name, category_id) {
    let data = [name, category_id];
    return this.dbInstance.executeSql(
      `UPDATE tasks SET name = ?, category_id = ? WHERE id = ${id}`, data)
    .then(() => {
      console.log("success edit task");
      this.getAllTasks();
    }, (e) => {
      console.log(JSON.stringify(e.err));
    });
  }

  updateTracking(id, seconds, tracking_time, tracking_date) {
    let data = [seconds, tracking_time];
    return this.dbInstance.executeSql(
      `UPDATE trackings SET seconds = ?, tracking_time = ? WHERE id = ${id}`, data)
    .then(() => {
      console.log("success edit tracking");
      this.getTrackings('', tracking_date);
    }, (e) => {
      console.log(JSON.stringify(e.err));
    });
  }

  deleteRow(table, id, other_id) {
    this.dbInstance.executeSql(`
      DELETE FROM ${table} WHERE id = ${id}`, [])
    .then((res) => {
      console.log("row deleted!");
      if (table == 'categories') {
        this.dbInstance.executeSql(
          `UPDATE tasks SET category_id = 0 WHERE category_id = ${id}`, [])
        .then(() => {
          console.log("update tasks with category deleted");
          this.refreshList(table);
        }, (e) => {
          console.log(JSON.stringify(e.err));
        });
      } else if (table == 'tasks') {
        this.dbInstance.executeSql(
          `DELETE FROM trackings WHERE task_id = ${id}`, [])
        .then(() => {
          console.log("deleted all trackings with task deleted");
          this.dbInstance.executeSql(`
            UPDATE categories SET number_tasks = number_tasks - 1 WHERE id = ${other_id}`, [])
          .then(() => {
            this.refreshList(table);
          }, (e) => {
            console.log(JSON.stringify(e.err));
          });
        }, (e) => {
          console.log(JSON.stringify(e.err));
        });
      } else {
        this.dbInstance.executeSql(`
          UPDATE tasks SET number_trackings = number_trackings - 1 WHERE id = ${other_id}`, [])
        .then(() => {
          this.refreshList(table);
        }, (e) => {
          console.log(JSON.stringify(e.err));
        });
        //this.refreshList(table);
      }
    })
    .catch(e => {
      console.log(JSON.stringify(e))
    });
  }

  refreshList(table) {
    if (table == 'categories') {
      this.getAllCategories();
      this.getAllTasks();
    } else if (table == 'tasks') {
      this.getAllTasks();
      this.getAllCategories();
      this.getTrackings('', this.getToday());
    } else {
      this.getTrackings('', this.getToday());
      this.getAllTasks();
    }
  }

  getToday() {
    let today = new Date();
    return ("0" + today.getDate()).slice(-2) + "-" + ("0"+(today.getMonth()+1)).slice(-2) + "-" + today.getFullYear();
  }

}
