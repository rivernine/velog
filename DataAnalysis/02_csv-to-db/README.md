# CSV to DB

## python
```py
import scipy.io
import csv
import pymysql

conn = pymysql.connect(host='192.168.56.100', port=3306, user='root', password='test', db='etl', charset='utf8')
curs = conn.cursor()
conn.commit()

f = open('test.csv','r')
csvReader = csv.reader(f)
# skip header
next(csvReader)

for row in csvReader:
    event_time = (row[0])
    category_code = (row[4])
    price = (row[6])
    user_id = (row[7])

    print(event_time, category_code, price, user_id)

    sql = """insert into orders (time, category, price, user_id) values (%s, %s, %s, %s)"""
    curs.execute(sql, (event_time, category_code, price, user_id))

#db의 변화 저장
conn.commit()

f.close()

conn.close()
```

## Create table
```mysql
CREATE TABLE orders  (
    id          bigint not null auto_increment,
    time        varchar(255),
    category    varchar(255),
    price       double,
    user_id     varchar(255),
    primary key (id)
) engine = InnoDB;
```

```mysql
MariaDB [(none)]> use etl;
Database changed

MariaDB [etl]> select * from orders;
Empty set (0.020 sec)

MariaDB [etl]> select * from orders;
+----+-------------------------+---------------------------+--------+-----------+
| id | time                    | category                  | price  | user_id   |
+----+-------------------------+---------------------------+--------+-----------+
|  1 | 2019-11-01 00:00:00 UTC | electronics.smartphone    | 489.07 | 520088904 |
|  2 | 2019-11-01 00:00:00 UTC | appliances.sewing_machine | 293.65 | 530496790 |
|  3 | 2019-11-01 00:00:01 UTC |                           | 28.31  | 561587266 |
|  4 | 2019-11-01 00:00:01 UTC | appliances.kitchen.washer | 712.87 | 518085591 |
|  5 | 2019-11-01 00:00:01 UTC | electronics.smartphone    | 183.27 | 558856683 |
|  6 | 2019-11-01 00:00:01 UTC | computers.notebook        | 360.09 | 520772685 |
|  7 | 2019-11-01 00:00:01 UTC | computers.notebook        | 514.56 | 514028527 |
+----+-------------------------+---------------------------+--------+-----------+
8 rows in set (0.000 sec)
```