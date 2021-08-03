import scipy.io
import csv
import pymysql

conn = pymysql.connect(host='192.168.56.100', port=3306, user='root', password='test', db='etl', charset='utf8')
curs = conn.cursor()
conn.commit()

f = open('C:/Users/LGCNS/Downloads/2019-Oct.csv','r')
csvReader = csv.reader(f)
# header skip
next(csvReader)

count = 0
for _, row in enumerate(csvReader):
  event_time = (row[0])
  event_type = (row[1])
  product_id = (row[2])
  category_id = (row[3])
  category_code = (row[4])
  brand = (row[5])
  price = (row[6])
  user_id = (row[7])

  if event_type != "purchase":
    continue
  sql = """insert into orders (time, product_id, category_id, category_code, brand, price, user_id) values (%s, %s, %s, %s, %s, %s, %s)"""
  curs.execute(sql, (event_time, product_id, category_id, category_code, brand, price, user_id))
  count += 1
  if count % 10000 == 0:
    print(count)
    conn.commit()

#db의 변화 저장
conn.commit()
f.close()
conn.close()

# CREATE TABLE orders  (
#     id            bigint not null auto_increment,
#     time          varchar(255),
#     product_id    varchar(255),
#     category_id   bigint,
#     category_code varchar(255),
#     brand         varchar(255),
#     price         double,
#     user_id       varchar(255),
#     primary key (id)
# ) engine = InnoDB;

