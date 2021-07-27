import scipy.io
import csv
import pymysql

conn = pymysql.connect(host='192.168.56.100', port=3306, user='root', password='test', db='etl', charset='utf8')
curs = conn.cursor()
conn.commit()

f = open('test.csv','r')
csvReader = csv.reader(f)

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