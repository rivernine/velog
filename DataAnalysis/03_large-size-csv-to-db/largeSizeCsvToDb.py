import pymysql
import pandas as pd

conn = pymysql.connect(host='192.168.56.100', port=3306, user='root', password='test', db='etl', charset='utf8')
curs = conn.cursor()
conn.commit()

chunksize = 10 ** 3
filepath = 'C:/Users/LGCNS/Downloads/2019-Nov.csv'
for cnt, chunk in enumerate(pd.read_csv(filepath, chunksize=chunksize)):
  chunk = chunk.where((pd.notnull(chunk)), None)
  indexs = chunk.index.values  
  print(len(indexs))
  print(indexs[:10], indexs[-10:])

  for index in indexs:
    event_time = chunk.loc[index].event_time
    product_id = chunk.loc[index].product_id
    category_id = chunk.loc[index].category_id
    category_code = chunk.loc[index].category_code
    brand = chunk.loc[index].brand
    price = chunk.loc[index].price
    user_id = chunk.loc[index].user_id
    sql = """insert into orders (time, product_id, category_id, category_code, brand, price, user_id) values (%s, %s, %s, %s, %s, %s, %s)"""
    curs.execute(sql, (event_time, product_id, category_id, category_code, brand, price, user_id))

  conn.commit()

conn.close()