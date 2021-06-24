# redis cluster

## architecture
|이름|주소|클러스터|
|-|-|-|
|PRD-P2P-ORD01-VM|172.26.1.4|redis-master-1, redis-slave-3|
|PRD-P2P-ORD02-VM|172.26.1.5|redis-master-2, redis-slave-1|
|PRD-P2P-ORD03-VM|172.26.1.6|redis-master-3, redis-slave-2|

## redis
```sh
$ redis-cli --cluster create 172.26.1.4:7051 172.26.1.5:7051 172.26.1.6:7051 172.26.1.5:7052 172.26.1.6:7052 172.26.1.4:7052 --cluster-replicas 1
```

## firewall
```sh
$ sudo firewall-cmd --list-all --permanent --zone=public
$ sudo firewall-cmd --permanent --add-port=7051/tcp --zone=public
$ sudo firewall-cmd --permanent --add-port=17051/tcp --zone=public
$ sudo firewall-cmd --permanent --add-port=7052/tcp --zone=public
$ sudo firewall-cmd --permanent --add-port=17052/tcp --zone=public

$ sudo firewall-cmd --permanent --remove-port=7001/tcp --zone=public
$ sudo firewall-cmd --permanent --remove-service=http --zone=public
$ sudo firewall-cmd --reload
```