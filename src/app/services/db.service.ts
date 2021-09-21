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
      tracking_date INTEGER, 
      start_time VARCHAR(16),
      end_time VARCHAR(16),
      minutes INTEGER, 
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
      let inserts_lan = (language == 'en' ? `INSERT INTO categories (name, icon) VALUES ('job', 'briefcase'), ('sport', 'bicycle'), ('hobbie', 'pizza')` : `INSERT INTO categories (name, icon) VALUES ('trabajo', 'briefcase'), ('deporte', 'bicycle'), ('hobbie', 'pizza')`);

      this.dbInstance.executeSql(inserts_lan, [])
      .then((res) => {
        console.log("exec sql inserts");
        console.log(JSON.stringify(res));

        this.getAllCategories();
        this.getAllTasks();
        //localStorage.setItem("executeIni", "yes");
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
    .then(() => {
      console.log("success add task");
      this.getAllTasks();
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

  deleteRow(table, id) {
    this.dbInstance.executeSql(`
      DELETE FROM ${table} WHERE id = ${id}`, [])
    .then(() => {
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
          this.refreshList(table);
        }, (e) => {
          console.log(JSON.stringify(e.err));
        });
      } else {
        this.refreshList(table);
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
    } else {

    }
  }

}
